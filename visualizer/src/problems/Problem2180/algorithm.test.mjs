import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2180 worked examples', () => {
  assert.equal(solve('4'), 2)
  assert.equal(solve('30'), 14)
  assert.equal(solve('1'), 0)
  assert.equal(solve('10'), 4)
})

test('2180 rejects invalid input', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('81'))
  assert.throws(() => parseInput('2.5'))
})

test('2180 every num agrees with a separate digit-sum count', () => {
  for (let num = 1; num <= 80; num++) {
    let expected = 0
    for (let x = 1; x <= num; x++) {
      let s = 0; for (const c of String(x)) s += Number(c)
      if (s % 2 === 0) expected++
    }
    assert.equal(solve(String(num)), expected, String(num))
  }
})

test('2180 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('12')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
