import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (target, words, costs) => buildTrace({ target, words, costs }).result

test('3213 official examples', () => {
  assert.equal(solve('abcdef', ['abdef', 'abc', 'd', 'def', 'ef'], [100, 1, 1, 10, 5]), 7)
})

test('3213 impossible and repeated words', () => {
  assert.equal(solve('abc', ['ab'], [1]), -1)
  // The word "a" is reused four times, at cost 2 each.
  assert.equal(solve('aaaa', ['a'], [2]), 8)
})

test('3213 rejects bad input', () => {
  assert.throws(() => parseInput('{"target": "AB", "words": ["a"], "costs": [1]}'), /lowercase/)
  assert.throws(() => parseInput('{"target": "ab", "words": ["a"], "costs": [1, 2]}'), /one integer/)
  assert.throws(() => parseInput('{"target": "ab", "words": ["a"], "costs": [0]}'), /1 to 100/)
})

// Independent oracle: top-down memoised recursion that tries each word at the front of the remaining target.
function oracle(target, words, costs) {
  const memo = new Map()
  const f = i => {
    if (i === target.length) return 0
    if (memo.has(i)) return memo.get(i)
    let best = Infinity
    words.forEach((w, k) => {
      if (target.startsWith(w, i)) best = Math.min(best, costs[k] + f(i + w.length))
    })
    memo.set(i, best)
    return best
  }
  const r = f(0)
  return r === Infinity ? -1 : r
}

test('3213 random cases match a top-down oracle', () => {
  let seed = 3213
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let target = ''
    const len = 1 + rnd(8)
    for (let i = 0; i < len; i++) target += 'ab'[rnd(2)]
    const words = []
    const costs = []
    const count = 1 + rnd(4)
    for (let k = 0; k < count; k++) {
      let w = ''
      const wl = 1 + rnd(3)
      for (let i = 0; i < wl; i++) w += 'ab'[rnd(2)]
      words.push(w)
      costs.push(1 + rnd(9))
    }
    assert.equal(solve(target, words, costs), oracle(target, words, costs), JSON.stringify({ target, words, costs }))
  }
})
