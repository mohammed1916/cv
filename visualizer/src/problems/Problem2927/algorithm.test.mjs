import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, limit) => buildTrace({ n, limit }).result
const pyLines = python.trim().split('\n').length

test('2927 teaching examples', () => {
  assert.equal(solve(5, 2), 3)
  assert.equal(solve(3, 3), 10)
  assert.equal(solve(0, 4), 1)
  assert.equal(solve(6, 1), 0)
  assert.equal(solve(4, 0), 0)
})

test('2927 parser rejects out-of-range values', () => {
  assert.throws(() => parseInput('{"n":-1,"limit":2}'))
  assert.throws(() => parseInput('{"n":3,"limit":31}'))
  assert.throws(() => parseInput('{"n":3.5,"limit":2}'))
})

// Brute oracle: every ordered triple of amounts.
function oracle(n, limit) {
  let count = 0
  for (let a = 0; a <= limit; a++) for (let b = 0; b <= limit; b++) for (let c = 0; c <= limit; c++) {
    if (a + b + c === n) count++
  }
  return count
}

test('2927 small inputs match the triple oracle', () => {
  for (let n = 0; n <= 20; n++) for (let limit = 0; limit <= 8; limit++) {
    assert.equal(solve(n, limit), oracle(n, limit), `n=${n} limit=${limit}`)
  }
})

test('2927 frames keep valid lines and a running total that ends at the result', () => {
  const run = buildTrace({ n: 5, limit: 2 })
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
  }
  assert.equal(run.frames.at(-1).total, run.result)
})
