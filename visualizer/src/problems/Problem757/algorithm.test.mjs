import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = iv => buildTrace(parseInput(JSON.stringify(iv))).result
// Oracle: smallest subset of 0..R-1 meeting every interval in >= 2 points (subset enumeration).
function brute(iv) {
  const R = Math.max(...iv.map(x => x[1])) + 1
  let best = Infinity
  for (let m = 0; m < 1 << R; m++) {
    let size = 0; for (let b = m; b; b &= b - 1) size++
    if (size >= best) continue
    if (iv.every(([s, e]) => { let c = 0; for (let p = s; p <= e; p++) if (m >> p & 1) c++; return c >= 2 })) best = size
  }
  return best
}
test('official examples', () => {
  assert.equal(solve([[1, 3], [3, 7], [8, 9]]), 5)
  assert.equal(solve([[1, 3], [1, 4], [2, 5], [3, 5]]), 3)
  assert.equal(solve([[1, 2], [2, 3], [2, 4], [4, 5]]), 5)
})
test('random small instances vs subset brute force', () => {
  let seed = 5
  const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n
  for (let t = 0; t < 400; t++) {
    const iv = Array.from({ length: 1 + rnd(5) }, () => { const s = rnd(8); return [s, s + 1 + rnd(8 - s)] })
    assert.equal(solve(iv), brute(iv), JSON.stringify(iv))
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('[[3,3]]'), /start < end/)
  assert.throws(() => parseInput('[]'), /1-40/)
  assert.throws(() => parseInput('[[1]]'), /Each interval/)
})
