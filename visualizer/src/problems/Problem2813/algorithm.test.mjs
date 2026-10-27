import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2813 official examples', () => {
  assert.equal(solve({ items: [[3, 2], [5, 1], [10, 1]], k: 2 }), 17)
  assert.equal(solve({ items: [[3, 1], [3, 1], [2, 2], [5, 3]], k: 3 }), 19)
})

test('2813 a swap can beat the first k items', () => {
  // Taking the two 1s gives 10 + 1 = 11. Swapping the second 1 for the 2 gives 8 + 4 = 12.
  assert.equal(solve({ items: [[5, 1], [5, 1], [3, 2]], k: 2 }), 12)
})

test('2813 rejects a category outside 1 to 4', () => {
  assert.throws(() => parseInput('{"items":[[1,5]],"k":1}'))
})

// Independent oracle: try every subset of k items and score it directly.
function oracle({ items, k }) {
  const n = items.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const picked = items.filter((_, i) => mask & (1 << i))
    if (picked.length !== k) continue
    const profit = picked.reduce((s, [p]) => s + p, 0)
    const distinct = new Set(picked.map(([, c]) => c)).size
    best = Math.max(best, profit + distinct * distinct)
  }
  return best
}

test('2813 seeded random inputs match a subset oracle', () => {
  let seed = 2813
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const items = Array.from({ length: n }, () => [1 + rnd(10), 1 + rnd(4)])
    const input = { items, k: 1 + rnd(n) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
