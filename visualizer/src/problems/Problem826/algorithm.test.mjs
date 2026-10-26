import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const solve = (difficulty, profit, worker) => buildTrace(parseInput(JSON.stringify({ difficulty, profit, worker }))).result
function brute(d, p, w) {
  return w.reduce((sum, a) => sum + d.reduce((m, x, i) => x <= a ? Math.max(m, p[i]) : m, 0), 0)
}
test('official examples', () => {
  assert.equal(solve([2, 4, 6, 8, 10], [10, 20, 30, 40, 50], [4, 5, 6, 7]), 100)
  assert.equal(solve([85, 47, 57], [24, 66, 99], [40, 25, 25]), 0)
})
test('random cases match per-worker brute force', () => {
  let seed = 9; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(8), m = 1 + rnd(8)
    const d = Array.from({ length: n }, () => 1 + rnd(20)), p = Array.from({ length: n }, () => 1 + rnd(50)), w = Array.from({ length: m }, () => 1 + rnd(20))
    assert.equal(solve(d, p, w), brute(d, p, w))
  }
})
test('invalid input rejected', () => {
  for (const bad of ['null', '{"difficulty":[1],"profit":[],"worker":[1]}', '{"difficulty":[1],"profit":[1],"worker":[]}', '{"difficulty":[0],"profit":[1],"worker":[1]}']) assert.throws(() => parseInput(bad))
})
