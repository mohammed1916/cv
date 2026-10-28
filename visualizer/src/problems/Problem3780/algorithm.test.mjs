import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3780 official examples', () => {
  assert.equal(solve([4, 2, 3, 1]), 9)
  assert.equal(solve([2, 1, 5]), 0)
})

test('3780 edge cases: three equal remainders, and a single remainder class', () => {
  assert.equal(solve([1, 4, 7]), 12)
  assert.equal(solve([3, 6, 9, 12]), 27)
})

test('3780 rejects fewer than three numbers', () => {
  assert.throws(() => parseInput('{"nums":[1,2]}'))
})

// Independent oracle: try every triple of positions and keep the largest sum divisible by 3.
function oracle(nums) {
  let best = 0
  const n = nums.length
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    const s = nums[i] + nums[j] + nums[k]
    if (s % 3 === 0 && s > best) best = s
  }
  return best
}

test('3780 random arrays match a triple-enumeration oracle', () => {
  let seed = 3780
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(14) + 3
    const nums = Array.from({ length: n }, () => rnd(200) + 1)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
