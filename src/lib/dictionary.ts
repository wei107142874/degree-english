export function baiduTranslateUrl(word: string): string {
  const query = encodeURIComponent(word.trim())
  return `https://fanyi.baidu.com/mtpe-individual/transText?query=${query}&lang=en2zh`
}
