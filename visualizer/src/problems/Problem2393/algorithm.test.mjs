import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = nums => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(count_increasing_subarrays(${JSON.stringify(nums)}))`]).toString().trim())

test('2393 worked examples', () => {
  assert.equal(solve([1, 3, 5, 4, 7]), 9)
  assert.equal(solve([2, 2, 2]), 3)
  assert.equal(solve([5]), 1)
})

test('2393 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [1, 2, 1] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2393 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[0]}'))
})

test('2393 random arrays match a brute force and the python mirror', () => {
  let seed = 2393
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(4))
    let brute = 0
    for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
      let ok = true
      for (let k = i + 1; k <= j; k++) if (nums[k] <= nums[k - 1]) ok = false
      if (ok) brute++
    }
    assert.equal(solve(nums), brute, JSON.stringify(nums))
    if (t < 8) assert.equal(runPy(nums), brute)
  }
})
