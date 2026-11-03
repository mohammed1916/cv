import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, d) => buildTrace({ nums, d }).result
const pyLines = python.trim().split('\n').length

test('2964 teaching examples', () => {
  assert.equal(solve([1, 1, 1, 1], 3), 4)
  assert.equal(solve([1, 2, 3], 3), 1)
  assert.equal(solve([3, 3, 3], 1), 1)
  assert.equal(solve([1, 2, 3, 4, 5], 3), 4)
  assert.equal(solve([0, 0, 0], 7), 1)
})

test('2964 parser rejects short lists and bad divisors', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"d":3}'))
  assert.throws(() => parseInput('{"nums":[1,2,3],"d":0}'))
  assert.throws(() => parseInput('{"nums":[1,-2,3],"d":3}'))
})

// Brute oracle: every index triple.
function oracle(nums, d) {
  const n = nums.length
  let count = 0
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    if ((nums[i] + nums[j] + nums[k]) % d === 0) count++
  }
  return count
}

test('2964 random inputs match the triple oracle', () => {
  let seed = 2964
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 3 + rnd(8) }, () => rnd(21))
    const d = 1 + rnd(10)
    assert.equal(solve(nums, d), oracle(nums, d), JSON.stringify({ nums, d }))
  }
})

test('2964 frames keep valid lines and keep every table row a valid count', () => {
  const run = buildTrace({ nums: [1, 2, 3, 4, 5], d: 3 })
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    for (const row of f.ways) for (const v of row) assert.ok(v >= 0)
  }
})
