import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('1006 small hand-checked values', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 2)
  assert.equal(solve(3), 6)
  assert.equal(solve(4), 7)
  assert.equal(solve(5), 7)
  assert.equal(solve(7), 6)
})

test('1006 every frame points at real code and Python lines', () => {
  for (const frame of buildTrace({ n: 9 }).frames) {
    assert.ok(frame.activeLine >= 1, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('1006 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"n":0}'), /n is/)
  assert.throws(() => parseInput('{"n":61}'), /n is/)
  assert.throws(() => parseInput('[4]'), /object/)
})

// Independent oracle: build the textual expression with explicit precedence and evaluate it with a value stack.
function oracle(n) {
  const ops = ['*', '/', '+', '-']
  const stack = [n]
  let op = 0
  for (let x = n - 1; x >= 1; x--, op++) {
    const o = ops[op % 4]
    if (o === '*' || o === '/') {
      const left = stack.pop()
      stack.push(o === '*' ? Math.trunc(left * x) : Math.trunc(left / x))
    } else {
      stack.push(o === '+' ? x : -x)
    }
  }
  return stack.reduce((a, b) => a + b, 0)
}

test('1006 values from 1 to 60 match a stack-based evaluator', () => {
  for (let n = 1; n <= 60; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})
