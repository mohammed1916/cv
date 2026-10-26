import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const solve = (A, B) => buildTrace(parseInput(JSON.stringify({ A, B }))).result
function brute(A, B) {
  const n = A.length; let best = 0
  for (let dr = -n + 1; dr < n; dr++) for (let dc = -n + 1; dc < n; dc++) {
    let c = 0
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const r = i + dr, k = j + dc
      if (r >= 0 && r < n && k >= 0 && k < n && A[i][j] && B[r][k]) c++
    }
    best = Math.max(best, c)
  }
  return best
}
test('official examples', () => {
  assert.equal(solve([[1, 1, 0], [0, 1, 0], [0, 1, 0]], [[0, 0, 0], [0, 1, 1], [0, 0, 1]]), 3)
  assert.equal(solve([[1]], [[1]]), 1); assert.equal(solve([[0]], [[0]]), 0)
})
test('random images match exhaustive translation', () => {
  let seed = 29; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const m = () => Array.from({ length: n }, () => Array.from({ length: n }, () => rnd(2)))
    const A = m(), B = m()
    assert.equal(solve(A, B), brute(A, B))
  }
})
test('invalid input rejected', () => {
  for (const bad of ['null', '{"A":[[1]],"B":[[1,0]]}', '{"A":[[2]],"B":[[1]]}', '{"A":[],"B":[]}', '{"A":[[1,0],[0]],"B":[[1,0],[0,1]]}']) assert.throws(() => parseInput(bad))
})
