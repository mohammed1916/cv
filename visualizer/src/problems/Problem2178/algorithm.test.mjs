import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2178 worked examples', () => {
  assert.deepEqual(solve('12'), [2, 4, 6])
  assert.deepEqual(solve('7'), [])
  assert.deepEqual(solve('28'), [2, 4, 6, 16])
  assert.deepEqual(solve('2'), [2])
})

test('2178 rejects invalid input', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('401'))
  assert.throws(() => parseInput('2.5'))
})

// Oracle: the largest number of distinct positive even parts whose sum is finalSum, found by trying every count.
function oracleCount(total) {
  if (total % 2) return 0
  let best = 0
  for (let c = 1; c * (c + 1) <= total; c++) if (c * (c + 1) <= total) best = c
  return best
}

test('2178 counts match the largest k with k(k+1) <= total', () => {
  for (let total = 2; total <= 400; total += 2) {
    const parts = solve(String(total))
    assert.equal(parts.length, oracleCount(total), String(total))
    assert.equal(parts.reduce((a, b) => a + b, 0), total)
    assert.ok(parts.every(p => p % 2 === 0 && p > 0))
  }
})

test('2178 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('28')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
