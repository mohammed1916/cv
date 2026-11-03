import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, x) => buildTrace({ nums, x }).result

// Independent oracle: prefix sums, and digits read by repeated division.
function oracle(nums, x) {
  const prefix = [0]
  for (const v of nums) prefix.push(prefix[prefix.length - 1] + v)
  const digitsOf = s => { const out = []; do { out.unshift(s % 10); s = Math.floor(s / 10) } while (s > 0); return out }
  let count = 0
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j <= nums.length; j++) {
    const d = digitsOf(prefix[j] - prefix[i])
    if (d[0] === x && d[d.length - 1] === x) count++
  }
  return count
}

test('3969 authored presets', () => {
  assert.equal(solve([1, 2, 3, 4], 3), 2)
  assert.equal(solve([5, 5, 10, 1], 5), oracle([5, 5, 10, 1], 5))
})

test('3969 single digit sums', () => {
  assert.equal(solve([7], 7), 1)
  assert.equal(solve([7], 1), 0)
  assert.equal(solve([1000], 1), 0)
  assert.equal(solve([101], 1), 1)
})

test('3969 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1],"x":0}'))
  assert.throws(() => parseInput('{"nums":[0],"x":1}'))
})

test('3969 random arrays match the prefix-sum oracle', () => {
  let seed = 3969
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(60))
    const x = 1 + rnd(9)
    assert.equal(solve(nums, x), oracle(nums, x), JSON.stringify({ nums, x }))
  }
})
