import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const distinct = a => new Set(a.slice(1).map((v, i) => Math.abs(v - a[i]))).size

test('667 official examples', () => {
  assert.equal(distinct(buildTrace({ n: 3, k: 1 }).result), 1)
  assert.equal(distinct(buildTrace({ n: 3, k: 2 }).result), 2)
})

test('667 every n up to 12 and k is a permutation with exactly k distinct differences', () => {
  for (let n = 2; n <= 12; n++) for (let k = 1; k < n; k++) {
    const perm = buildTrace({ n, k }).result
    assert.deepEqual([...perm].sort((a, b) => a - b), Array.from({ length: n }, (_, i) => i + 1), `n=${n} k=${k}`)
    assert.equal(distinct(perm), k, `n=${n} k=${k}`)
  }
})

test('667 rejects k ≥ n', () => {
  assert.throws(() => parseInput('{"n":3,"k":3}'))
})
