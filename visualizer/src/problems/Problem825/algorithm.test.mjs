import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const solve = a => buildTrace(parseInput(JSON.stringify(a))).result
function brute(ages) {
  let c = 0
  for (let i = 0; i < ages.length; i++) for (let j = 0; j < ages.length; j++) {
    if (i === j) continue
    const x = ages[i], y = ages[j]
    if (y <= 0.5 * x + 7 || y > x || (y > 100 && x < 100)) continue
    c++
  }
  return c
}
test('official examples', () => {
  assert.equal(solve([16, 16]), 2); assert.equal(solve([16, 17, 18]), 2); assert.equal(solve([20, 30, 100, 110, 120]), 3)
})
test('random arrays match the O(n^2) pair check', () => {
  let seed = 11; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  for (let t = 0; t < 300; t++) {
    const a = Array.from({ length: 1 + rnd(40) }, () => 1 + rnd(120))
    assert.equal(solve(a), brute(a))
  }
})
test('invalid input rejected', () => {
  for (const bad of ['[]', '[0]', '[121]', '[1.5]', '{}', 'null']) assert.throws(() => parseInput(bad))
})
