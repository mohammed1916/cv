import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = nums => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(closest_to_zero(${JSON.stringify(nums)}))`]).toString().trim())

test('2239 worked examples', () => {
  assert.equal(solve([-6, 5, -2, 9]), -2)
  assert.equal(solve([2, -1, 1]), 1)
})

test('2239 a tie goes to the larger value', () => {
  assert.equal(solve([-3, 3]), 3)
  assert.equal(solve([5, -5, -5]), 5)
  assert.equal(solve([-7]), -7)
})

test('2239 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [3, -3] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2239 random arrays match a sorted oracle and the python mirror', () => {
  let seed = 2239
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(15) - 7)
    const oracle = [...nums].sort((a, b) => Math.abs(a) - Math.abs(b) || b - a)[0]
    assert.equal(solve(nums), oracle, JSON.stringify(nums))
    if (t < 8) assert.equal(runPy(nums), oracle)
  }
})
