import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, m, l, r) => buildTrace(parseInput(JSON.stringify({ nums, m, l, r }))).result

test('3956 official examples', () => {
  assert.equal(solve([4, 1, -5, 2], 2, 1, 3), 7)
  assert.equal(solve([1, 0, 3, 4], 2, 1, 2), 8)
  assert.equal(solve([-1, 7, -4], 1, 2, 3), 6)
  assert.equal(solve([-3, -4, -1], 2, 1, 2), -1)
})

test('3956 a single value with l = r = 1', () => {
  assert.equal(solve([5], 1, 1, 1), 5)
})

test('3956 rejects r above n', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"m":1,"l":1,"r":3}'))
})

// Independent oracle: list every subarray with a valid length, then try every set of them.
function oracle(nums, m, l, r) {
  const n = nums.length
  const intervals = []
  for (let s = 0; s < n; s++) for (let e = s; e < n; e++) {
    const len = e - s + 1
    if (len >= l && len <= r) intervals.push([s, e, nums.slice(s, e + 1).reduce((a, b) => a + b, 0)])
  }
  let best = -Infinity
  for (let mask = 1; mask < 1 << intervals.length; mask++) {
    const chosen = intervals.filter((_, idx) => (mask >> idx) & 1)
    if (chosen.length > m) continue
    let disjoint = true
    for (let a = 0; a < chosen.length && disjoint; a++) for (let b = a + 1; b < chosen.length; b++) {
      if (!(chosen[a][1] < chosen[b][0] || chosen[b][1] < chosen[a][0])) { disjoint = false; break }
    }
    if (!disjoint) continue
    const total = chosen.reduce((acc, c) => acc + c[2], 0)
    if (total > best) best = total
  }
  return best
}

test('3956 random small arrays match an enumerate-every-set oracle', () => {
  let seed = 3956
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(5)
    const nums = Array.from({ length: n }, () => rnd(41) - 20)
    const m = 1 + rnd(n)
    const l = 1 + rnd(n)
    const r = l + rnd(n - l + 1)
    assert.equal(solve(nums, m, l, r), oracle(nums, m, l, r), JSON.stringify({ nums, m, l, r }))
  }
})
