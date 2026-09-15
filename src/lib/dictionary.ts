type BaiduTranslateUrlOptions = {
  isMobile?: boolean
}

function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent)
}

export function baiduTranslateUrl(word: string, options: BaiduTranslateUrlOptions = {}): string {
  const query = encodeURIComponent(word.trim())
  if (options.isMobile ?? isMobileBrowser()) {
    return `https://fanyi.baidu.com/m/trans?from=en&to=zh&query=${query}`
  }
  return `https://fanyi.baidu.com/mtpe-individual/transText?query=${query}&lang=en2zh`
}
