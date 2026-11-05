import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = nums => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(count_zero_filled_subarrays(${JSON.stringify(nums)}))`]).toString().trim())

test('2348 worked examples', () => {
  assert.equal(solve([0, 0, 1, 0, 0, 0]), 9)
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([0]), 1)
})

test('2348 negative values are not zero', () => {
  assert.equal(solve([-1, 0, 0, -2]), 3)
})

test('2348 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [0, 1, 0] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2348 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[4]}'))
})

test('2348 random arrays match a brute force and the python mirror', () => {
  let seed = 2348
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(7) - 3)
    let brute = 0
    for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) if (nums.slice(i, j + 1).every(x => x === 0)) brute++
    assert.equal(solve(nums), brute, JSON.stringify(nums))
    if (t < 8) assert.equal(runPy(nums), brute)
  }
})
