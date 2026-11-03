import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

// Oracle: try every choice of k - 1 cut positions.
function oracle(nums, k) {
  const n = nums.length
  let best = Infinity
  for (let mask = 0; mask < 1 << (n - 1); mask += 1) {
    const cuts = []
    for (let c = 0; c < n - 1; c += 1) if (mask & (1 << c)) cuts.push(c + 1)
    if (cuts.length !== k - 1) continue
    const bounds = [0, ...cuts, n]
    let total = 0
    for (let b = 0; b + 1 < bounds.length; b += 1) {
      let s = 0
      for (let x = bounds[b]; x < bounds[b + 1]; x += 1) s += nums[x]
      total += (s * (s + 1)) / 2
    }
    best = Math.min(best, total)
  }
  return best
}

test('3929 hand-checked presets', () => {
  assert.equal(solve([3, 1, 4, 1, 5], 2), oracle([3, 1, 4, 1, 5], 2))
  assert.equal(solve([2, 2, 2, 2], 3), oracle([2, 2, 2, 2], 3))
})

test('3929 one part costs the triangular number of the total', () => {
  assert.equal(solve([1, 2, 3], 1), 6 * 7 / 2)
})

test('3929 k equal to length makes every value its own part', () => {
  assert.equal(solve([3, 0, 5], 3), 6 + 0 + 15)
})

test('3929 zeros cost nothing', () => {
  assert.equal(solve([0, 0, 0], 2), 0)
})

test('3929 parser rejects k above the length', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

test('3929 matches the cut-position oracle on random inputs', () => {
  let seed = 3929
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => rnd(10))
    const k = 1 + rnd(nums.length)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
