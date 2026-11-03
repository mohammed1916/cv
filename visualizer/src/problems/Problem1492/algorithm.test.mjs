import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, k) => buildTrace({ n, k }).result

test('1492 sample inputs return the expected factor', () => {
  assert.equal(solve(12, 3), 3)
  assert.equal(solve(7, 2), 7)
  assert.equal(solve(7, 3), -1)
  assert.equal(solve(36, 4), 4)
  assert.equal(solve(1, 1), 1)
})

test('1492 frames line up with pseudocode and Python', () => {
  assert.equal(python.split('\n').length, code.length)
  for (const frame of buildTrace({ n: 12, k: 2 }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(frame.pythonLine, frame.activeLine)
  }
})

test('1492 rejects malformed input', () => {
  assert.throws(() => parseInput('[12, 3]'), /object/)
  assert.throws(() => parseInput('{"n":0,"k":1}'), /n is/)
  assert.throws(() => parseInput('{"n":5,"k":1001}'), /k is/)
})

test('1492 every n up to 60 matches a divisor-list oracle', () => {
  for (let n = 1; n <= 60; n++) {
    const divisors = []
    for (let d = 1; d <= n; d++) if (n % d === 0) divisors.push(d)
    for (let k = 1; k <= n + 1; k++) {
      assert.equal(solve(n, k), k <= divisors.length ? divisors[k - 1] : -1, `n=${n} k=${k}`)
    }
  }
})
