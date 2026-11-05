import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, threshold) => buildTrace({ nums, threshold }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (nums, threshold) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(longest_subarray_above(${JSON.stringify(nums)}, ${threshold}))`]).toString().trim())

// A length k works when some window of length k has every element above threshold / k.
function feasible(nums, threshold, k) {
  for (let i = 0; i + k <= nums.length; i++) {
    if (nums.slice(i, i + k).every(x => x * k > threshold)) return true
  }
  return false
}

test('2334 worked examples', () => {
  const r = solve([1, 3, 4, 3, 1], 6)
  assert.ok(r === 3 && feasible([1, 3, 4, 3, 1], 6, r))
  assert.equal(solve([6, 5, 6, 5, 8], 7), 5)
  assert.equal(solve([1, 1, 1], 9), -1)
})

test('2334 the returned length is always a feasible one', () => {
  let seed = 2334
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(9))
    const threshold = 1 + rnd(40)
    const r = solve(nums, threshold)
    let any = false
    for (let k = 1; k <= nums.length; k++) if (feasible(nums, threshold, k)) any = true
    if (r === -1) assert.equal(any, false, JSON.stringify({ nums, threshold }))
    else assert.ok(feasible(nums, threshold, r), JSON.stringify({ nums, threshold, r }))
    if (t < 8) assert.equal(runPy(nums, threshold), r)
  }
})

test('2334 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [2, 3, 4], threshold: 3 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2334 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"threshold":1}'))
  assert.throws(() => parseInput('{"nums":[1],"threshold":0}'))
})
