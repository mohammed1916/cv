import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2169 worked examples', () => {
  assert.equal(solve('[2,3]'), 3)
  assert.equal(solve('[10,10]'), 1)
  assert.equal(solve('[0,7]'), 0)
  assert.equal(solve('[5,4]'), 5)
})

test('2169 rejects invalid input', () => {
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('[-1,2]'))
  assert.throws(() => parseInput('[1.5,2]'))
  assert.throws(() => parseInput('[61,2]'))
})

function oracle(a, b) {
  let ops = 0
  while (a && b) { if (a >= b) a -= b; else b -= a; ops++ }
  return ops
}

test('2169 matches a reference loop over all small pairs', () => {
  for (let a = 0; a <= 20; a++) for (let b = 0; b <= 20; b++) {
    assert.equal(solve(JSON.stringify([a, b])), oracle(a, b), `${a},${b}`)
  }
})

test('2169 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[2,3]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
