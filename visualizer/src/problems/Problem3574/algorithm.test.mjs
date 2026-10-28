import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3574 official examples', () => {
  assert.equal(solve([2, 4], 1), 8)
  assert.equal(solve([3, 5, 7], 2), 14)
  assert.equal(solve([5, 5, 5], 1), 15)
})

test('3574 doubling a single element can be the best choice', () => {
  assert.equal(solve([7], 1), 14)
  assert.equal(solve([7], 0 + 1), 14)
})

test('3574 rejects k of zero', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Independent oracle: try every set of at most k doublings across the whole array, then every subarray of the result.
function oracle(nums, k) {
  const n = nums.length
  const g = (a, b) => (b === 0 ? a : g(b, a % b))
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let count = 0
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) count++
    if (count > k) continue
    const arr = nums.map((x, i) => ((mask >> i) & 1 ? 2 * x : x))
    for (let l = 0; l < n; l++) {
      let gg = 0
      for (let r = l; r < n; r++) {
        gg = g(gg, arr[r])
        best = Math.max(best, (r - l + 1) * gg)
      }
    }
  }
  return best
}

test('3574 random arrays match a try-every-doubling oracle', () => {
  let seed = 3574
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 150; trial++) {
    const n = 1 + rnd(6)
    const nums = Array.from({ length: n }, () => 1 + rnd(24))
    const k = 1 + rnd(n)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
