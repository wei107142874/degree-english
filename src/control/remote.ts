// ============================================================
// 手机遥控电脑背单词（实时控制通道）
// ------------------------------------------------------------
// 复用局域网同步服务器：手机 POST /api/control/send 发指令，
// 服务器通过 SSE（/api/control/events）广播给所有连接端。
// 手机端开启「遥控模式」后：点认识/模糊/不认识 → 本机不发声，
// 指令转发到电脑端，电脑执行同样的复习并自动翻卡 + 朗读。
// 仅当页面由局域网服务器提供（location.origin 可连 /api/control/*）时可用。
// ============================================================

import { useEffect, useState } from 'react'
import { getDeviceId, getSyncStatus, onSyncStatus } from '../sync/client'

export interface ControlMsg {
  deviceId: string
  type: 'grade' | 'ping'
  wordId?: string
  correct?: boolean
  ts?: number
}

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
        // 忽略自己发出的指令（避免手机收到自己的回显）
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

/** 发送一条控制指令（手机遥控用），返回是否送达服务器 */
export async function sendControl(msg: Omit<ControlMsg, 'deviceId'>): Promise<boolean> {
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
