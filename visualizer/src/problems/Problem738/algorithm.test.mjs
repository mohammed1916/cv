import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const monotone = s => [...s].every((c, i) => i === 0 || s[i - 1] <= c)

test('738 worked examples', () => {
  assert.equal(buildTrace(10).result, 9)
  assert.equal(buildTrace(1234).result, 1234)
  assert.equal(buildTrace(332).result, 299)
  assert.equal(buildTrace(1332).result, 1299)
})

test('738 every value up to 3000 matches a brute-force search downward', () => {
  for (let n = 0; n <= 3000; n++) {
    let best = n
    while (!monotone(String(best))) best--
    assert.equal(buildTrace(n).result, best, String(n))
  }
})

test('738 rejects negative numbers', () => {
  assert.throws(() => parseInput('-4'))
})
