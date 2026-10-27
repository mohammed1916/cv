import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('1787 official examples', () => {
  assert.equal(solve([1, 2, 0, 3, 0], 1), 3)
  assert.equal(solve([3, 4, 5, 2, 1, 7, 3, 4, 7], 3), 3)
  assert.equal(solve([1, 2, 4, 1, 2, 5, 1, 2, 6], 3), 3)
})

test('1787 a window of one must be all zeros; equal classes that xor to a nonzero value need one change', () => {
  assert.equal(solve([7, 7, 7], 1), 3)
  // Three classes of one value each: 5 xor 5 xor 5 = 5, so changing one element to 0 gives xor 0.
  assert.equal(solve([5, 5, 5], 3), 1)
})

test('1787 rejects a window longer than the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: try every replacement value in 0..7 for each class, then keep the cheapest assignment whose xor is 0.
function oracle(nums, k) {
  const groups = Array.from({ length: k }, (_, r) => nums.filter((_, i) => i % k === r))
  let best = Infinity
  const pick = (r, xor, cost) => {
    if (r === k) {
      if (xor === 0) best = Math.min(best, cost)
      return
    }
    for (let p = 0; p < 8; p++) pick(r + 1, xor ^ p, cost + groups[r].filter(v => v !== p).length)
  }
  pick(0, 0, 0)
  return best
}

test('1787 random arrays match a brute-force oracle', () => {
  let seed = 1787
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const nums = Array.from({ length: n }, () => rnd(8))
    const k = 1 + rnd(Math.min(n, 4))
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
