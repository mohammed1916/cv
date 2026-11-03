import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (cards, x) => buildTrace({ cards, x }).result

test('3664 invented example', () => {
  assert.equal(solve(['ca', 'bc', 'cc', 'ac', 'cb', 'bb'], 'c'), 2)
})

test('3664 cards without x never pair', () => {
  assert.equal(solve(['ab', 'cd', 'ef'], 'z'), 0)
  assert.equal(solve(['aa', 'aa'], 'a'), 0)
})

// Oracle: maximum matching by exhaustive search over card subsets.
function oracle(cards, x) {
  const pool = cards.filter(c => c.includes(x))
  const compatible = (a, b) => [0, 1].filter(k => a[k] !== b[k]).length === 1
  const memo = new Map()
  const best = mask => {
    if (mask === 0) return 0
    if (memo.has(mask)) return memo.get(mask)
    const i = 31 - Math.clz32(mask & -mask)
    const without = mask & ~(1 << i)
    let result = best(without)
    for (let j = 0; j < pool.length; j++) {
      if ((without >> j) & 1 && compatible(pool[i], pool[j])) result = Math.max(result, 1 + best(without & ~(1 << j)))
    }
    memo.set(mask, result)
    return result
  }
  return best((1 << pool.length) - 1)
}

test('3664 random inputs match the matching oracle', () => {
  let seed = 3664
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  const letters = 'abcx'
  for (let t = 0; t < 300; t++) {
    const x = letters[rand(3)]
    const cards = Array.from({ length: 2 + rand(9) }, () => letters[rand(4)] + letters[rand(4)])
    assert.equal(solve(cards, x), oracle(cards, x), JSON.stringify({ cards, x }))
  }
})

test('3664 rejects a card that is not two letters', () => {
  assert.throws(() => parseInput('{"cards":["abc","de"],"x":"a"}'))
})
