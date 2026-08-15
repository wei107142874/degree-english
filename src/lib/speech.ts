import { useSettingsStore } from '../store/useSettingsStore'

export type SpeakEngine = 'auto' | 'local' | 'online'

let voices: SpeechSynthesisVoice[] = []
let voicesLoaded = false

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const synth = window.speechSynthesis
  voices = synth.getVoices()
  if (!voicesLoaded) {
    voicesLoaded = true
    synth.onvoiceschanged = () => {
      voices = synth.getVoices()
    }
  }
}
loadVoices()

/** 本地是否有英语语音可用 */
export function hasLocalEnglishVoice(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  // 再刷新一次（部分浏览器首次调用为空）
  if (voices.length === 0) voices = window.speechSynthesis.getVoices()
  return voices.some(v => (v.lang || '').toLowerCase().startsWith('en'))
}

/** 朗读引擎可用性说明（设置页展示） */
export function engineStatus(): { local: boolean; note: string } {
  const local = hasLocalEnglishVoice()
  return {
    local,
    note: local
      ? '本机有英语语音，离线也能发音'
      : '本机无英语语音（国产安卓常见），已自动使用在线发音（需联网）',
  }
}

function speakLocal(text: string, lang: string): boolean {
  if (!hasLocalEnglishVoice()) return false
  try {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.85
    // voice 赋值在某些安卓浏览器可能失败（语音对象不可用），不影响默认发音
    try {
      const enVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'))
      const exact = enVoices.find(v => (v.lang || '').toLowerCase() === lang.toLowerCase())
      u.voice = exact ?? enVoices[0]
    } catch { /* 忽略：使用默认语音 */ }
    synth.speak(u)
    return true
  } catch {
    return false
  }
}

function speakOnline(text: string): boolean {
  try {
    // 有道词典发音接口：type=1 英音 / type=2 美音
    const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(text) + '&type=2'
    const audio = new Audio(url)
    audio.play().catch(() => {
      // 自动播放被拒时（极少，因为通常是点击触发），忽略
    })
    return true
  } catch {
    return false
  }
}

/**
 * 朗读入口：按设置引擎朗读。返回实际使用的方式。
 */
export function speak(text: string, lang = 'en-US'): 'local' | 'online' | 'none' {
  if (!text) return 'none'
  const engine = useSettingsStore.getState().settings.speakEngine ?? 'auto'
  if (engine === 'online') {
    return speakOnline(text) ? 'online' : 'none'
  }
  if (engine === 'local') {
    return speakLocal(text, lang) ? 'local' : 'none'
  }
  // auto：本地可用用本地，否则在线
  if (speakLocal(text, lang)) return 'local'
  return speakOnline(text) ? 'online' : 'none'
}
