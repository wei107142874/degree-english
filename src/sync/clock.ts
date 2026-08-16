// 客户端与服务器时钟偏差（服务器时间 - 本机时间）。
// 局域网同步按「记录最后修改时间最新者胜」合并，若两端设备时钟不一致，
// 先按探测到的服务器时间校准，保证比较公平、不会误判新旧。
let offsetMs = 0;

export function setClockOffset(ms: number) {
  offsetMs = ms;
}

/** 校准后的当前时间（毫秒），默认未校准时等同于 Date.now() */
export function now(): number {
  return Date.now() + offsetMs;
}
