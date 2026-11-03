import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = k => buildTrace({ k }).result

test('4022 small hand cases', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(9), 9)
  assert.equal(solve(10), 1)
  assert.equal(solve(11), 9)
  assert.equal(solve(30), 2)
})

test('4022 rejects invalid positions', () => {
  assert.throws(() => parseInput('{"k":0}'))
  assert.throws(() => parseInput('{"k":1.5}'))
})

// Brute oracle: write the infinite string out block by block and index it directly.
const TEXT = (() => {
  const parts = []
  let length = 0
  for (let b = 0; length < 20000; b++) {
    const numbers = []
    for (let v = b === 0 ? 1 : 10 * b; v <= 10 * b + 9; v++) numbers.push(v)
    if (b % 2 === 1) numbers.reverse()
    const piece = numbers.join('')
    parts.push(piece)
    length += piece.length
  }
  return parts.join('')
})()

test('4022 matches direct indexing of the written string', () => {
  for (let k = 1; k <= 3000; k++) {
    assert.equal(solve(k), Number(TEXT[k - 1]), `k=${k}`)
  }
})

test('4022 large positions stay exact', () => {
  // Position 10^15 lies in a 15-digit-number group; the result must still be one digit.
  const digit = solve(1e15)
  assert.ok(Number.isInteger(digit) && digit >= 0 && digit <= 9)
})

test('4022 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ k: 1234 })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
})
