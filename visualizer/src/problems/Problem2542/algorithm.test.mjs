import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2542 official examples', () => {
  assert.equal(solve({ nums1: [1, 3, 3, 2], nums2: [2, 1, 3, 4], k: 3 }), 12)
  assert.equal(solve({ nums1: [4, 2, 3, 1, 1], nums2: [7, 5, 10, 9, 6], k: 1 }), 30)
})

test('2542 k equal to the length takes every pair', () => {
  assert.equal(solve({ nums1: [2, 5], nums2: [3, 4], k: 2 }), 7 * 3)
})

test('2542 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1],"k":1}'))
})

// Independent oracle: try every subset of k indices and take the best sum times the smallest nums2.
function oracle({ nums1, nums2, k }) {
  const n = nums1.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const chosen = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) chosen.push(i)
    if (chosen.length !== k) continue
    const sum = chosen.reduce((s, i) => s + nums1[i], 0)
    const low = Math.min(...chosen.map(i => nums2[i]))
    best = Math.max(best, sum * low)
  }
  return best
}

test('2542 seeded random inputs match a subset oracle', () => {
  let seed = 2542
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums1 = Array.from({ length: n }, () => rnd(21))
    const nums2 = Array.from({ length: n }, () => rnd(21))
    const input = { nums1, nums2, k: 1 + rnd(n) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
