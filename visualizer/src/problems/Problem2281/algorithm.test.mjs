import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = strength => buildTrace({ strength }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = s => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(sum_of_total_strength(${JSON.stringify(s)}))`]).toString().trim())

function brute(strength) {
  let total = 0n
  for (let i = 0; i < strength.length; i++) {
    let min = Infinity, sum = 0n
    for (let j = i; j < strength.length; j++) {
      min = Math.min(min, strength[j])
      sum += BigInt(strength[j])
      total += BigInt(min) * sum
    }
  }
  return Number(total % 1000000007n)
}

test('2281 worked examples', () => {
  assert.equal(solve([1, 3, 1, 2]), brute([1, 3, 1, 2]))
  assert.equal(solve([5, 4, 6]), brute([5, 4, 6]))
  assert.equal(solve([7]), 49)
})

test('2281 equal strengths count each group once', () => {
  assert.equal(solve([2, 2]), 2 * 2 + 2 * 2 + 2 * 4)
})

test('2281 frames point at real python lines', () => {
  for (const f of buildTrace({ strength: [2, 1, 3] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2281 random arrays match a brute force and the python mirror', () => {
  let seed = 2281
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const s = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(12))
    assert.equal(solve(s), brute(s), JSON.stringify(s))
    if (t < 8) assert.equal(runPy(s), brute(s))
  }
})
