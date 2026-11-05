import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2177 worked examples', () => {
  assert.deepEqual(solve('33'), [10, 11, 12])
  assert.deepEqual(solve('4'), [])
  assert.deepEqual(solve('0'), [-1, 0, 1])
  assert.deepEqual(solve('3'), [0, 1, 2])
})

test('2177 rejects invalid input', () => {
  assert.throws(() => parseInput('-3'))
  assert.throws(() => parseInput('1.5'))
  assert.throws(() => parseInput('2000000'))
})

test('2177 results sum to num whenever a triple is returned', () => {
  for (let num = 0; num <= 300; num++) {
    const triple = solve(String(num))
    if (num % 3 === 0) assert.equal(triple.reduce((a, b) => a + b, 0), num)
    else assert.deepEqual(triple, [])
  }
})

test('2177 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('33')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
