import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, swaps) => buildTrace({ nums, swaps }).result

test('3695 official examples', () => {
  assert.equal(solve([1, 2, 3], [[0, 2], [1, 2]]), 4)
  assert.equal(solve([1, 2, 3], [[1, 2]]), 2)
  assert.equal(solve([1, 1000000000, 1, 1000000000, 1, 1000000000], []), -2999999997)
})

test('3695 rejects a swap with p not less than q', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"swaps":[[1,0]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"swaps":[[0,1],[0,1]]}'))
})

// Independent oracle: breadth-first search over every arrangement reachable by applying the swaps.
function oracle(nums, swaps) {
  const seen = new Set([nums.join(',')])
  const queue = [nums]
  let best = -Infinity
  while (queue.length > 0) {
    const cur = queue.shift()
    best = Math.max(best, cur.reduce((sum, v, i) => (i % 2 === 0 ? sum + v : sum - v), 0))
    for (const [p, q] of swaps) {
      const next = [...cur]
      ;[next[p], next[q]] = [next[q], next[p]]
      const key = next.join(',')
      if (!seen.has(key)) { seen.add(key); queue.push(next) }
    }
  }
  return best
}

test('3695 random inputs match a reachable-arrangement oracle', () => {
  let seed = 3695
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(5)
    const nums = Array.from({ length: n }, () => 1 + rnd(99))
    const swaps = []
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) if (rnd(3) === 0) swaps.push([p, q])
    assert.equal(solve(nums, swaps), oracle(nums, swaps), JSON.stringify({ nums, swaps }))
  }
})
