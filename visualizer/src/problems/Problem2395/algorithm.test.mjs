import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = nums => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(has_equal_pair_sums(${JSON.stringify(nums)}))`]).toString().trim() === 'True'

test('2395 worked examples', () => {
  assert.equal(solve([1, 2, 4, 8, 16]), false)
  assert.equal(solve([1, 2, 3, 4, 3]), true)
  assert.equal(solve([1, 2, 1, 2]), true)
  assert.equal(solve([5, 5]), false)
})

test('2395 a repeated pair sum is found even when values repeat', () => {
  assert.equal(solve([3, 1, 2, 4]), false)
  assert.equal(solve([-1, 1, 0, 0]), true)
})

test('2395 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [1, 2, 1, 2] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2395 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1]}'))
})

test('2395 random arrays match a brute force and the python mirror', () => {
  let seed = 2395
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 2 + rnd(8) }, () => rnd(7) - 3)
    let brute = false
    for (let i = 0; i + 1 < nums.length; i++) for (let j = i + 1; j + 1 < nums.length; j++) if (nums[i] + nums[i + 1] === nums[j] + nums[j + 1]) brute = true
    assert.equal(solve(nums), brute, JSON.stringify(nums))
    if (t < 8) assert.equal(runPy(nums), brute)
  }
})
