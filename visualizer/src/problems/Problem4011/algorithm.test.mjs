import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, a, b) => buildTrace({ nums, a, b }).result

test('4011 small hand cases', () => {
  assert.equal(solve([1], 1, 1), 1)
  assert.equal(solve([2], 1, 1), 0)
  assert.equal(solve([1, 2], 1, 1), 2)
  assert.equal(solve([1, 2, 4], 1, 1), 2)
})

test('4011 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"a":1,"b":1}'))
  assert.throws(() => parseInput('{"nums":[1],"a":0,"b":1}'))
})

// Brute oracle: take every subarray as a slice and compare the ratio with a fraction check.
function brute(nums, a, b) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const part = nums.slice(i, j + 1)
      const odd = part.filter(v => v % 2 === 1).length
      const even = part.length - odd
      if (odd === 0) continue
      const ratio = even / odd
      if (ratio <= a / b + 1e-12) count++
    }
  }
  return count
}

test('4011 matches a slice-by-slice oracle', () => {
  let seed = 4011
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(9))
    const a = 1 + rnd(5)
    const b = 1 + rnd(5)
    assert.equal(solve(nums, a, b), brute(nums, a, b), JSON.stringify({ nums, a, b }))
  }
})

test('4011 equality is counted exactly', () => {
  // [1], [2,1] and [1,2] reach ratios 0, 1 and 1; the two ratios of 1 equal 1/1 exactly and both count.
  assert.equal(solve([2, 1, 2], 1, 1), 3)
})

test('4011 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ nums: [1, 2, 3, 4], a: 1, b: 1 })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
})
