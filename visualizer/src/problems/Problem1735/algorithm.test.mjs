import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = queries => buildTrace(parseInput(JSON.stringify({ queries }))).result

test('1735 small products', () => {
  assert.deepEqual(solve([[2, 6]]), [4])
  assert.deepEqual(solve([[5, 1]]), [1])
  assert.deepEqual(solve([[2, 6], [5, 1], [3, 4]]), [4, 1, 6])
})

test('1735 rejects bad input', () => {
  assert.throws(() => parseInput('{"queries":[[0,2]]}'))
  assert.throws(() => parseInput('{"queries":[[2,21]]}'))
  assert.throws(() => parseInput('{"queries":[]}'))
})

// Independent oracle: enumerate every array of n positive values up to k and count those with product k.
function oracle(n, k) {
  let count = 0
  const values = Array(n).fill(1)
  const total = k ** n
  for (let code = 0; code < total; code++) {
    let c = code
    let product = 1
    for (let i = 0; i < n; i++) { values[i] = (c % k) + 1; c = Math.floor(c / k); product *= values[i] }
    if (product === k) count++
  }
  return count
}

test('1735 random queries match the enumeration oracle', () => {
  let seed = 1735
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(4)
    const k = 1 + rnd(12)
    assert.deepEqual(solve([[n, k]]), [oracle(n, k) % 1000000007], JSON.stringify([n, k]))
  }
})
