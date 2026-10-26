import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = a => buildTrace(parseInput(JSON.stringify(a))).result
// Oracle: exhaustive matching (pick first element, try every partner with partner = 2x or x = 2*partner).
function oracle(a) {
  if (!a.length) return true
  const [x, ...rest] = a
  for (let i = 0; i < rest.length; i++) {
    const y = rest[i]
    if (y === 2 * x || x === 2 * y) if (oracle([...rest.slice(0, i), ...rest.slice(i + 1)])) return true
  }
  return false
}
test('official examples', () => {
  assert.equal(solve([3, 1, 3, 6]), false)
  assert.equal(solve([2, 1, 2, 6]), false)
  assert.equal(solve([4, -2, 2, -4]), true)
})
test('random arrays vs exhaustive matching', () => {
  let seed = 17; const rnd = n => Math.floor(((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * n)
  let yes = 0
  for (let t = 0; t < 2000; t++) {
    const len = 2 * (1 + rnd(4))
    const a = Array.from({ length: len }, () => [0, 1, 2, 4, -1, -2, -4, 3, 6][rnd(9)])
    const r = solve(a)
    assert.equal(r, oracle(a), JSON.stringify(a))
    if (r) yes++
  }
  assert.ok(yes > 50)
})
test('rejects bad input', () => {
  for (const bad of ['[1]', '[1,2,3]', '[]', '[1.5,3]', '"ab"', '[1,2000]']) assert.throws(() => parseInput(bad))
})
