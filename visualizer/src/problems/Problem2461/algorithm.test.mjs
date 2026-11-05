import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (nums, k) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(max_sum_distinct_window(${JSON.stringify(nums)}, ${k}))`]).toString().trim())

test('2461 worked examples', () => {
  assert.equal(solve([1, 5, 4, 2, 9, 9, 9], 3), 15)
  assert.equal(solve([4, 4, 4], 3), 0)
  assert.equal(solve([3, 1, 2], 2), 4)
})

test('2461 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [1, 2, 3], k: 2 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2461 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

test('2461 random arrays match a brute force and the python mirror', () => {
  let seed = 2461
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 2 + rnd(8) }, () => 1 + rnd(6))
    const k = 1 + rnd(nums.length)
    let brute = 0
    for (let i = 0; i + k <= nums.length; i++) {
      const w = nums.slice(i, i + k)
      if (new Set(w).size === k) brute = Math.max(brute, w.reduce((a, b) => a + b, 0))
    }
    assert.equal(solve(nums, k), brute, JSON.stringify({ nums, k }))
    if (t < 8) assert.equal(runPy(nums, k), brute)
  }
})
