import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, minK, maxK) => buildTrace({ nums, minK, maxK }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (nums, a, b) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(count_fixed_bounds(${JSON.stringify(nums)}, ${a}, ${b}))`]).toString().trim())

test('2444 worked examples', () => {
  assert.equal(solve([1, 3, 5, 2, 7, 5], 1, 5), 2)
  assert.equal(solve([2, 2, 2], 2, 2), 6)
  assert.equal(solve([4, 1], 1, 4), 1)
})

test('2444 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [1, 2, 3], minK: 1, maxK: 3 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2444 rejects bad bounds', () => {
  assert.throws(() => parseInput('{"nums":[1],"minK":3,"maxK":2}'))
})

test('2444 random arrays match a brute force and the python mirror', () => {
  let seed = 2444
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(6))
    const minK = 1 + rnd(3), maxK = minK + rnd(4)
    let brute = 0
    for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
      const s = nums.slice(i, j + 1)
      if (Math.min(...s) === minK && Math.max(...s) === maxK) brute++
    }
    assert.equal(solve(nums, minK, maxK), brute, JSON.stringify({ nums, minK, maxK }))
    if (t < 8) assert.equal(runPy(nums, minK, maxK), brute)
  }
})
