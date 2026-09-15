import { describe, expect, it } from 'vitest'
import { baiduTranslateUrl } from '../src/lib/dictionary'

describe('dictionary links', () => {
  it('builds a Baidu Translate English-to-Chinese detail URL', () => {
    expect(baiduTranslateUrl('deal')).toBe(
      'https://fanyi.baidu.com/mtpe-individual/transText?query=deal&lang=en2zh',
    )
  })

  it('encodes words before putting them in the query string', () => {
    expect(baiduTranslateUrl('look up', { isMobile: false })).toBe(
      'https://fanyi.baidu.com/mtpe-individual/transText?query=look%20up&lang=en2zh',
    )
  })

  it('builds the mobile Baidu Translate URL on mobile devices', () => {
    expect(baiduTranslateUrl('hello', { isMobile: true })).toBe(
      'https://fanyi.baidu.com/m/trans?from=en&to=zh&query=hello',
    )
  })
})
