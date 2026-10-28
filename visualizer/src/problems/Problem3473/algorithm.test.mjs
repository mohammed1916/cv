import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, m) => buildTrace({ nums, k, m }).result

test('3473 official examples', () => {
  assert.equal(solve([1, 2, -1, 3, 3, 4], 2, 2), 13)
  assert.equal(solve([-10, 3, -1, -2], 4, 1), -10)
})

test('3473 k subarrays of length one each', () => {
  assert.equal(solve([5, -2, 7], 3, 1), 10)
})

test('3473 rejects k above length divided by m', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"k":2,"m":2}'))
})

// Independent oracle: try every set of k disjoint intervals of length at least m and keep the best sum.
function oracle(nums, k, m) {
  const n = nums.length
  const intervals = []
  for (let a = 0; a < n; a++) for (let b = a + m; b <= n; b++) intervals.push([a, b])
  let best = -Infinity
  const pick = (start, chosen, total) => {
    if (chosen === k) {
      best = Math.max(best, total)
      return
    }
    for (let idx = start; idx < intervals.length; idx++) {
      const [a, b] = intervals[idx]
      // Choose intervals in increasing index order so each set is tried once; it must not overlap the ones picked.
      const ok = pickedEnd.every(([x, y]) => b <= x || a >= y)
      if (!ok) continue
      pickedEnd.push([a, b])
      pick(idx + 1, chosen + 1, total + nums.slice(a, b).reduce((s, v) => s + v, 0))
      pickedEnd.pop()
    }
  }
  const pickedEnd = []
  pick(0, 0, 0)
  return best
}

test('3473 random arrays match an enumerate-every-interval-set oracle', () => {
  let seed = 3473
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(7)
    const m = 1 + rnd(3)
    if (n < m) continue
    const k = 1 + rnd(Math.floor(n / m))
    const nums = Array.from({ length: n }, () => rnd(21) - 10)
    assert.equal(solve(nums, k, m), oracle(nums, k, m), JSON.stringify({ nums, k, m }))
  }
})
