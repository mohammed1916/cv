import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const solve = (f, b) => buildTrace(parseInput(JSON.stringify({ fronts: f, backs: b }))).result
function brute(f, b) {
  const n = f.length; let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const front = f.map((x, i) => mask >> i & 1 ? b[i] : x)
    const back = f.map((x, i) => mask >> i & 1 ? x : b[i])
    for (const v of back) if (!front.includes(v) && (best === 0 || v < best)) best = v
  }
  return best
}
test('official examples', () => {
  assert.equal(solve([1, 2, 4, 4, 7], [1, 3, 4, 1, 3]), 2)
  assert.equal(solve([1], [1]), 0)
})
test('matches exhaustive flipping on random small cases', () => {
  let seed = 3; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(8)
    const f = Array.from({ length: n }, () => 1 + rnd(6)), b = Array.from({ length: n }, () => 1 + rnd(6))
    assert.equal(solve(f, b), brute(f, b))
  }
})
test('invalid input rejected', () => {
  for (const bad of ['null', '{"fronts":[1],"backs":[]}', '{"fronts":[],"backs":[]}', '{"fronts":[0],"backs":[1]}', '{"fronts":[1.5],"backs":[1]}']) assert.throws(() => parseInput(bad))
})
