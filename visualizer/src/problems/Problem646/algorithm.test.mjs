import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('646 official examples', () => {
  assert.equal(buildTrace([[1, 2], [2, 3], [3, 4]]).result, 2)
  assert.equal(buildTrace([[1, 2], [7, 8], [4, 5]]).result, 3)
  assert.equal(buildTrace([[-6, 9], [1, 6], [8, 10], [-1, 4], [-6, -2], [-9, 8], [-5, 3], [0, 3]]).result, 3)
})

test('646 random pairs match an O(n²) longest-chain dynamic program', () => {
  let state = 27
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 400; t++) {
    const pairs = Array.from({ length: 1 + rand(8) }, () => { const a = rand(20) - 10; return [a, a + 1 + rand(8)] })
    const sorted = [...pairs].sort((x, y) => x[1] - y[1] || x[0] - y[0])
    const dp = sorted.map(() => 1)
    for (let i = 0; i < sorted.length; i++) for (let j = 0; j < i; j++) if (sorted[j][1] < sorted[i][0]) dp[i] = Math.max(dp[i], dp[j] + 1)
    assert.equal(buildTrace(pairs).result, Math.max(...dp), JSON.stringify(pairs))
  }
})

test('646 rejects pairs with left ≥ right', () => {
  assert.throws(() => parseInput('[[2,2]]'))
})
