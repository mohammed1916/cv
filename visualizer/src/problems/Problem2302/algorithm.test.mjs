import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (nums, k) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(count_low_score_subarrays(${JSON.stringify(nums)}, ${k}))`]).toString().trim())

function brute(nums, k) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    for (let j = i; j < nums.length; j++) {
      sum += nums[j]
      if (sum * (j - i + 1) < k) count++
    }
  }
  return count
}

test('2302 worked examples', () => {
  assert.equal(solve([1, 2, 3], 6), 3)
  assert.equal(solve([5], 5), 0)
  assert.equal(solve([1], 2), 1)
})

test('2302 the bound is strict', () => {
  assert.equal(solve([2, 2], 8), 2)
  assert.equal(solve([2, 2], 9), 3)
})

test('2302 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [2, 1, 3], k: 5 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2302 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[0],"k":1}'))
})

test('2302 random arrays match a brute force and the python mirror', () => {
  let seed = 2302
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(6))
    const k = 1 + rnd(60)
    assert.equal(solve(nums, k), brute(nums, k), JSON.stringify({ nums, k }))
    if (t < 8) assert.equal(runPy(nums, k), brute(nums, k))
  }
})
