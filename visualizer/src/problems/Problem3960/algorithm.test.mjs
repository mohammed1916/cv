import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = a => buildTrace(a).result

// Independent oracle: check every subarray by building its frequency multiset from scratch.
function oracle(a) {
  let best = 0
  for (let l = 0; l < a.length; l++) {
    for (let r = l; r < a.length; r++) {
      const freq = new Map()
      for (let i = l; i <= r; i++) freq.set(a[i], (freq.get(a[i]) ?? 0) + 1)
      const distinctFreqs = [...new Set(freq.values())]
      const single = freq.size === 1
      const pair = distinctFreqs.length === 2 && Math.max(...distinctFreqs) === 2 * Math.min(...distinctFreqs)
      if (single || pair) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

test('3960 authored presets', () => {
  assert.equal(solve([1, 1, 2, 2, 2]), 3)
  assert.equal(solve([7, 7, 7, 3]), 3)
})

test('3960 values sharing one frequency do not qualify', () => {
  // Every window of [1,2,3] has distinct values sharing one frequency, so only length 1 qualifies.
  assert.equal(solve([1, 2, 3]), 1)
  assert.equal(solve([4, 4, 5, 5]), 3)  // [4,4,5] has levels 2 and 1
})

test('3960 f and 2f levels qualify', () => {
  assert.equal(solve([1, 2, 2]), 3)
  assert.equal(solve([3, 3, 3, 8, 8]), 3)  // [3,8,8] has levels 1 and 2
})

test('3960 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1.5]'))
})

test('3960 random arrays match the rebuild-every-window oracle', () => {
  let seed = 3960
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const a = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(4))
    assert.equal(solve(a), oracle(a), JSON.stringify(a))
  }
})
