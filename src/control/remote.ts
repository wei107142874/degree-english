// ============================================================
// 手机遥控电脑背单词（实时控制通道）
// ------------------------------------------------------------
// 复用局域网同步服务器：手机 POST /api/control/send 发消息，
// 服务器通过 SSE（/api/control/events）广播给所有连接端。
//
// 角色：
//   - 电脑端（显示端，默认）：本机正常学习；收到手机指令后执行
//     并广播完整会话状态（当前词/翻面/模式/遮罩/自测选项/进度）。
//   - 手机端（遥控端，开启遥控后）：只显示电脑广播的状态、只发
//     指令，本机静音、不写本地数据。所有操作（认识/模糊/不认识、
//     翻面、切模式、遮罩、自测答题、朗读）都实时同步到电脑。
//
// 仅当页面由局域网服务器提供（location.origin 可连 /api/control/*）时可用。
// ============================================================

import { useEffect, useState } from 'react'
import { getDeviceId, getSyncStatus, onSyncStatus } from '../sync/client'

/** 电脑端广播的完整会话状态（手机端照此渲染） */
export interface RemoteState {
  mode: 'flashcard' | 'quiz'
  wordId: string
  flipped: boolean
  maskWord: boolean
  idx: number           // 第几张（从 1 起）
  total: number
  quizOptions: string[] // 自测模式的 4 个选项（单词 id）
  quizChoice: number | null
  quizCorrectIdx: number // 作答前为 -1（不泄露答案）；作答后为正确项下标
  finished: boolean
  doneCount: number
  sessionCorrect: number
  progress: string
  marked?: boolean       // 当前词是否「重点记忆」（复习页使用）
  hasMore?: boolean      // 复习页：是否还有下一批可继续复习
}

export type ControlPayload =
  | { type: 'state'; state: RemoteState }
  | {
      type: 'cmd'
      action: 'grade' | 'flip' | 'mode' | 'mask' | 'quiz' | 'speak' | 'hello' | 'mark' | 'continue' | 'restart'
      wordId?: string
      correct?: boolean
      mode?: 'flashcard' | 'quiz'
      on?: boolean
      choice?: number
    }

export type ControlMsg = { deviceId: string } & ControlPayload

type Listener = (msg: ControlMsg) => void

let listeners = new Set<Listener>()
let es: EventSource | null = null
let esStarted = false

function ensureStream() {
  if (es || esStarted) return
  esStarted = true
  try {
    es = new EventSource(location.origin + '/api/control/events')
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as ControlMsg
        // 忽略自己发出的消息（避免收到自己的回显）
        if (!msg || !msg.type || msg.deviceId === getDeviceId()) return
        const copy = { ...msg }
        listeners.forEach(l => { try { l(copy) } catch { /* 忽略 */ } })
      } catch { /* 忽略非 JSON 或心跳 */ }
    }
    // EventSource 断线会自动重连
  } catch { /* 不支持 EventSource 的环境 */ }
}

/** 订阅控制消息（返回取消订阅函数）。仅同步服务器可达时真正建立连接。 */
export function onControl(cb: Listener): () => void {
  listeners.add(cb)
  if (getSyncStatus().supported === true) ensureStream()
  return () => { listeners.delete(cb) }
}

/** 发送一条控制消息，返回是否送达服务器 */
export async function sendControl(msg: ControlPayload): Promise<boolean> {
  try {
    const res = await fetch(location.origin + '/api/control/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId(), ...msg }),
    })
    return res.ok
  } catch {
    return false
  }
}

/** 控制通道是否可用（已连上局域网同步服务器） */
export function useControlAvailable(): boolean {
  const [ok, setOk] = useState(getSyncStatus().supported === true)
  useEffect(() => onSyncStatus(s => setOk(s.supported === true)), [])
  return ok
}
