import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = nums => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(longest_max_and_subarray(${JSON.stringify(nums)}))`]).toString().trim())

test('2419 worked examples', () => {
  assert.equal(solve([1, 2, 3, 3, 2, 2]), 2)
  assert.equal(solve([1, 2, 3, 4]), 1)
  assert.equal(solve([5, 5, 5]), 3)
})

test('2419 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [2, 2] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2419 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[8]}'))
})

test('2419 random arrays match a subarray brute force and the python mirror', () => {
  let seed = 2419
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(7))
    let bestAnd = 0, bestLen = 0
    for (let i = 0; i < nums.length; i++) {
      let and = nums[i]
      for (let j = i; j < nums.length; j++) {
        and &= nums[j]
        if (and > bestAnd) { bestAnd = and; bestLen = j - i + 1 }
        else if (and === bestAnd) bestLen = Math.max(bestLen, j - i + 1)
      }
    }
    assert.equal(solve(nums), bestLen, JSON.stringify(nums))
    if (t < 8) assert.equal(runPy(nums), bestLen)
  }
})
