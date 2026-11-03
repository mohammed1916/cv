import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = n => buildTrace(n).result

test('2847 worked values', () => {
  assert.equal(solve(1), '1')
  assert.equal(solve(7), '7')
  assert.equal(solve(12), '26')
  assert.equal(solve(36), '49')
  assert.equal(solve(11), '-1')
})

test('2847 the answer is a string with the fewest digits, sorted ascending', () => {
  assert.equal(solve(8), '8')
  assert.equal(solve(64), '88')
  assert.equal(solve(1000), '5558')
})

test('2847 rejects malformed input', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('2.5'))
  assert.throws(() => parseInput('"12"'))
})

// Oracle: enumerate every non-decreasing multiset of digits 2..9 up to a length cap, keep the smallest product match.
function oracle(n) {
  let best = null
  const better = (a, b) => a.length < b.length || (a.length === b.length && a < b)
  const rec = (start, digits, product) => {
    if (product === n && digits.length > 0) {
      const text = digits.join('')
      if (best === null || better(text, best)) best = text
    }
    if (digits.length === 14) return
    for (let d = start; d <= 9; d++) {
      if (product * d > n || n % (product * d) !== 0) continue
      rec(d, [...digits, d], product * d)
    }
  }
  if (n === 1) return '1'
  rec(2, [], 1)
  return best ?? '-1'
}

test('2847 values up to 2000 match an enumeration oracle', () => {
  for (let n = 1; n <= 2000; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})

test('2847 every frame points at real pseudocode and python lines', () => {
  const run = buildTrace(360)
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
  }
  assert.equal(run.result, '589')
})
