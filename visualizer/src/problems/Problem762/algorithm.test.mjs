import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (l, r) => buildTrace(parseInput(JSON.stringify([l, r]))).result
function isPrime(n) { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true }
function oracle(l, r) {
  let c = 0
  for (let x = l; x <= r; x++) { let b = 0, y = x; while (y) { b += y & 1; y >>= 1 } if (isPrime(b)) c++ }
  return c
}
test('official examples', () => { assert.equal(solve(6, 10), 4); assert.equal(solve(10, 15), 5) })
test('random ranges vs trial-division oracle', () => {
  let seed = 3
  const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n
  for (let t = 0; t < 300; t++) {
    const l = 1 + rnd(1000000 - 200), w = rnd(201)
    assert.equal(solve(l, l + w), oracle(l, l + w))
  }
  assert.equal(solve(1, 1), 0)
})
test('last frame is done and invalid input rejected', () => {
  const run = buildTrace(parseInput('[6, 10]'))
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('[10, 6]'), /left/)
  assert.throws(() => parseInput('[1, 1000]'), /cap/)
  assert.throws(() => parseInput('[1]'), /Enter/)
})
