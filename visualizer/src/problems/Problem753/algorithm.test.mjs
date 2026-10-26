import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, k) => buildTrace(parseInput(JSON.stringify({ n, k }))).result
// Structural oracle: the string has minimal length and contains each of the k^n passwords exactly once as a window.
function check(n, k, s) {
  assert.equal(s.length, k ** n + n - 1)
  assert.ok([...s].every(c => +c < k))
  const windows = new Set()
  for (let i = 0; i + n <= s.length; i++) windows.add(s.slice(i, i + n))
  assert.equal(windows.size, k ** n)
}
test('official examples', () => {
  assert.equal(solve(1, 2), '10')
  check(2, 2, solve(2, 2))
})
test('every permitted small (n,k) satisfies the de Bruijn property', () => {
  for (let n = 1; n <= 4; n++) for (let k = 1; k <= 10; k++) if (k ** n <= 500) check(n, k, solve(n, k))
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"n": 5, "k": 2}'), /Need/)
  assert.throws(() => parseInput('{"n": 4, "k": 5}'), /cap/)
  assert.throws(() => parseInput('3'), /Enter/)
})
