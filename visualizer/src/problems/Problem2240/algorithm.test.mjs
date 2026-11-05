import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (total, cost1, cost2) => buildTrace({ total, cost1, cost2 }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (t, a, b) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(ways_to_buy(${t}, ${a}, ${b}))`]).toString().trim())

test('2240 worked examples', () => {
  assert.equal(solve(12, 4, 3), brute(12, 4, 3))
  assert.equal(solve(3, 4, 5), 1)
})

test('2240 the empty purchase counts once', () => {
  assert.equal(solve(1, 2, 2), 1)
  assert.equal(solve(3, 3, 1), 5)
})

test('2240 frames point at real python lines', () => {
  for (const f of buildTrace({ total: 6, cost1: 2, cost2: 3 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

const brute = (t, a, b) => { let c = 0; for (let x = 0; x * a <= t; x++) for (let y = 0; x * a + y * b <= t; y++) c++; return c }

test('2240 matches a double loop and the python mirror', () => {
  for (let t = 1; t <= 30; t++) for (const [a, b] of [[1, 1], [2, 3], [4, 7], [9, 2]]) {
    let brute = 0
    for (let x = 0; x * a <= t; x++) for (let y = 0; x * a + y * b <= t; y++) brute++
    assert.equal(solve(t, a, b), brute, `${t} ${a} ${b}`)
  }
  assert.equal(runPy(20, 3, 4), solve(20, 3, 4))
})

test('2240 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"total":0,"cost1":1,"cost2":1}'))
})
