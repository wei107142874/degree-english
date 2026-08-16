import { useSettingsStore } from '../store/useSettingsStore'

export type SpeakEngine = 'auto' | 'local' | 'online'

let voices: SpeechSynthesisVoice[] = []
let voicesLoaded = false
let currentAudio: HTMLAudioElement | null = null

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
      ? '本机有英语语音。「自动」模式优先在线发音，断网时自动回退本地语音'
      : '本机无英语语音（国产安卓常见）。「自动」模式使用在线发音（需联网）',
  }
}

/** 停止一切正在播放的声音（在线音频 + 本地语音），避免重叠 */
function stopAll() {
  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.src = ''
    } catch { /* 忽略 */ }
    currentAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch { /* 忽略 */ }
  }
}

function speakLocal(text: string, lang: string): boolean {
  if (!hasLocalEnglishVoice()) return false
  try {
    const synth = window.speechSynthesis
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.85
    // voice 赋值在某些安卓浏览器可能失败（语音对象不可用），不影响默认发音
    try {
      const enVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'))
      const exact = enVoices.find(v => (v.lang || '').toLowerCase() === lang.toLowerCase())
      u.voice = exact ?? enVoices[0]
    } catch { /* 忽略：使用默认语音 */ }
    // 某些浏览器 cancel() 后立即 speak() 会被吞掉，稍作延迟更稳
    setTimeout(() => {
      try { synth.speak(u) } catch { /* 忽略 */ }
    }, 30)
    return true
  } catch {
    return false
  }
}

function speakOnline(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      if (timer) clearTimeout(timer)
      resolve(ok)
    }
    try {
      // 有道词典发音接口：type=1 英音 / type=2 美音
      const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(text) + '&type=2'
      const audio = new Audio(url)
      currentAudio = audio
      // 兜底超时：网络卡住时也能回退到本地语音
      timer = setTimeout(() => finish(false), 6000)
      audio.onerror = () => finish(false)
      audio.play().then(() => finish(true)).catch(() => finish(false))
    } catch {
      finish(false)
    }
  })
}

/**
 * 朗读入口：按设置引擎朗读。返回实际使用的方式（异步）。
 */
export async function speak(text: string, lang = 'en-US'): Promise<'local' | 'online' | 'none'> {
  if (!text) return 'none'
  const engine = useSettingsStore.getState().settings.speakEngine ?? 'auto'

  stopAll()

  if (engine === 'online') {
    return (await speakOnline(text)) ? 'online' : 'none'
  }
  if (engine === 'local') {
    return speakLocal(text, lang) ? 'local' : 'none'
  }
  // auto：优先在线发音（清晰稳定，PC/手机都可靠）；离线或失败时回退本地语音
  if (typeof navigator !== 'undefined' && navigator.onLine !== false) {
    if (await speakOnline(text)) return 'online'
  }
  return speakLocal(text, lang) ? 'local' : 'none'
}
