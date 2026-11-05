import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = nums => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(longest_nice_subarray(${JSON.stringify(nums)}))`]).toString().trim())

test('2401 worked examples', () => {
  assert.equal(solve([1, 3, 8, 48, 10]), 3)
  assert.equal(solve([3, 1, 5, 11, 13]), 1)
  assert.equal(solve([7]), 1)
})

test('2401 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [1, 2, 3] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2401 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

test('2401 random arrays match a pairwise brute force and the python mirror', () => {
  let seed = 2401
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(31))
    let brute = 0
    for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
      let ok = true
      for (let a = i; a <= j; a++) for (let b = a + 1; b <= j; b++) if ((nums[a] & nums[b]) !== 0) ok = false
      if (ok) brute = Math.max(brute, j - i + 1)
    }
    assert.equal(solve(nums), brute, JSON.stringify(nums))
    if (t < 8) assert.equal(runPy(nums), brute)
  }
})
