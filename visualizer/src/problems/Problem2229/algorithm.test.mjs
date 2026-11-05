import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = nums => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(is_consecutive(${JSON.stringify(nums)}))`]).toString().trim() === 'True'

test('2229 worked examples', () => {
  assert.equal(solve([4, 2, 5, 3]), true)
  assert.equal(solve([7, 9]), false)
  assert.equal(solve([6, 5, 6]), false)
  assert.equal(solve([3, 5, 4]), true)
})

test('2229 duplicates fail even when the span matches', () => {
  assert.equal(solve([2, 2, 4]), false)
  assert.equal(solve([5]), true)
})

test('2229 frames point at real lines', () => {
  for (const f of buildTrace({ nums: [4, 2, 2] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2229 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[1.5]}'))
})

test('2229 random arrays match the sorted-gap oracle and the python mirror', () => {
  let seed = 2229
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(6)
    const nums = Array.from({ length: n }, () => rnd(9))
    const s = [...nums].sort((a, b) => a - b)
    const oracle = s.every((x, i) => i === 0 || x === s[i - 1] + 1)
    assert.equal(solve(nums), oracle, JSON.stringify(nums))
    if (t < 15) assert.equal(runPy(nums), oracle, JSON.stringify(nums))
  }
})
