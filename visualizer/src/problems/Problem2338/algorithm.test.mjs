import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2338 examples', () => {
  assert.equal(solve({ n: 2, max_value: 5 }), 10)
  assert.equal(solve({ n: 5, max_value: 3 }), 11)
})

test('2338 edge cases', () => {
  assert.equal(solve({ n: 1, max_value: 7 }), 7)
  assert.equal(solve({ n: 12, max_value: 1 }), 1)
})

test('2338 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":0,"max_value":3}'))
  assert.throws(() => parseInput('{"n":3,"max_value":41}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: enumerate every array of length n and test the divisibility rule directly.
function oracle(n, maxV) {
  let count = 0
  const fill = arr => {
    if (arr.length === n) {
      for (let i = 1; i < n; i++) if (arr[i] % arr[i - 1] !== 0) return
      count++
      return
    }
    for (let v = 1; v <= maxV; v++) fill([...arr, v])
  }
  fill([])
  return count
}

test('2338 random small cases match brute force enumeration', () => {
  let seed = 2338
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(4)
    const maxV = 1 + rnd(7)
    assert.equal(solve({ n, max_value: maxV }), oracle(n, maxV), JSON.stringify({ n, maxV }))
  }
})
