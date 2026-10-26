import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('624 official examples', () => {
  assert.equal(buildTrace([[1, 2, 3], [4, 5], [1, 2, 3]]).result, 4)
  assert.equal(buildTrace([[1], [1]]).result, 0)
  assert.equal(buildTrace([[1], [-1]]).result, 2)
})

test('624 random arrays match a pairwise brute force across different arrays', () => {
  let state = 9
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 400; t++) {
    const arrays = Array.from({ length: 2 + rand(4) }, () => Array.from({ length: 1 + rand(4) }, () => rand(21) - 10))
    let expected = 0
    arrays.forEach((a, i) => arrays.forEach((b, j) => { if (i !== j) for (const x of a) for (const y of b) expected = Math.max(expected, Math.abs(x - y)) }))
    assert.equal(buildTrace(arrays).result, expected, JSON.stringify(arrays))
  }
})

test('624 rejects a single array', () => {
  assert.throws(() => parseInput('[[1,2]]'))
})
