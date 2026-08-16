import { describe, it, expect } from 'vitest'
import { ALL_WORDS } from '../src/data/words'
import { WORD_ORDER_SEED, buildOrderIndex, seededShuffle } from '../src/lib/wordOrder'

describe('固定随机词序', () => {
  it('同一种子生成完全一致的顺序（确定性、可复现）', () => {
    const a = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8], 'seed-x')
    const b = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8], 'seed-x')
    expect(a).toEqual(b)
  })

  it('不同种子顺序不同', () => {
    const a = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8], 'seed-a')
    const b = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8], 'seed-b')
    expect(a).not.toEqual(b)
  })

  it('词序是全部单词的全排列（无遗漏、无重复）', () => {
    const order = buildOrderIndex(ALL_WORDS, WORD_ORDER_SEED)
    expect(order.size).toBe(ALL_WORDS.length)
    const positions = [...order.values()].sort((x, y) => x - y)
    expect(positions).toEqual(ALL_WORDS.map((_, i) => i))
  })

  it('默认词序不是字母序', () => {
    const order = buildOrderIndex(ALL_WORDS, WORD_ORDER_SEED)
    const sorted = [...order.entries()].sort((a, b) => a[1] - b[1]).map(e => e[0])
    const alphabetical = ALL_WORDS.map(w => w.id)
    expect(sorted).not.toEqual(alphabetical)
  })
})
