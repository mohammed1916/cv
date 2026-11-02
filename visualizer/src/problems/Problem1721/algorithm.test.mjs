import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (head, k) => buildTrace({ head, k }).result

test('1721 worked examples', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5], 2), [1, 4, 3, 2, 5])
  assert.deepEqual(solve([7, 9, 6, 6, 7, 8, 3, 0, 9, 5], 5), [7, 9, 6, 6, 8, 7, 3, 0, 9, 5])
  assert.deepEqual(solve([1], 1), [1])
  assert.deepEqual(solve([1, 2], 1), [2, 1])
})

test('1721 rejects k outside the list', () => {
  assert.throws(() => parseInput('{"head":[1,2],"k":3}'))
})

// Oracle: index arithmetic on a plain array; the k-th from the end is index n - k.
function oracle(head, k) {
  const out = head.slice()
  const a = k - 1, b = head.length - k
  ;[out[a], out[b]] = [out[b], out[a]]
  return out
}

test('1721 random lists match an index-swap oracle', () => {
  let seed = 1721
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const head = Array.from({ length: n }, () => rnd(100))
    const k = 1 + rnd(n)
    assert.deepEqual(solve(head, k), oracle(head, k), JSON.stringify({ head, k }))
  }
})
