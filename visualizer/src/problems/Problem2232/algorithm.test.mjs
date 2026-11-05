import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = expression => buildTrace({ expression }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = expression => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(minimize_result("${expression}"))`]).toString().trim()
const evaluate = s => {
  const m = s.match(/^(\d*)\((\d+)\+(\d+)\)(\d*)$/)
  return (m[1] ? Number(m[1]) : 1) * (Number(m[2]) + Number(m[3])) * (m[4] ? Number(m[4]) : 1)
}

test('2232 worked examples', () => {
  assert.equal(solve('316+52'), '3(16+5)2')
  assert.equal(solve('12+34'), '1(2+3)4')
  assert.equal(solve('999+999'), '(999+999)')
})

test('2232 frames point at real python lines', () => {
  for (const f of buildTrace({ expression: '12+34' }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2232 rejects malformed expressions', () => {
  assert.throws(() => parseInput('{"expression":"1+2+3"}'))
  assert.throws(() => parseInput('{"expression":"12"}'))
})

test('2232 finds a minimum that matches a brute force over every pair of parentheses', () => {
  const samples = ['247+38', '12+34', '1+1', '9+9', '1234+5', '5+6789', '12+345']
  for (const e of samples) {
    const plus = e.indexOf('+')
    let min = Infinity
    for (let i = 0; i < plus; i++) for (let j = plus + 2; j <= e.length; j++) {
      min = Math.min(min, evaluate(`${e.slice(0, i)}(${e.slice(i, plus)}+${e.slice(plus + 1, j)})${e.slice(j)}`))
    }
    assert.equal(evaluate(solve(e)), min, e)
    assert.equal(runPy(e), solve(e), e)
  }
})
