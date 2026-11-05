import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (num1, num2) => buildTrace({ num1, num2 }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (a, b) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(add_two_integers(${a}, ${b}))`]).toString().trim())

test('2235 worked examples', () => {
  assert.equal(solve(7, -3), 4)
  assert.equal(solve(-8, 3), -5)
})

test('2235 negative and zero operands', () => {
  assert.equal(solve(-100, -100), -200)
  assert.equal(solve(0, 0), 0)
  assert.equal(runPy(-3, 8), 5)
})

test('2235 frames point at real python lines', () => {
  for (const f of buildTrace({ num1: 1, num2: 2 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2235 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"num1":101,"num2":0}'))
})
