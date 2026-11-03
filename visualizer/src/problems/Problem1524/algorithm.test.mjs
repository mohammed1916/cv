import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = arr => buildTrace({ arr }).result

function oracle(arr) {
  let count = 0
  for (let i = 0; i < arr.length; i++) {
    let sum = 0
    for (let j = i; j < arr.length; j++) {
      sum += arr[j]
      if (sum % 2 === 1) count++
    }
  }
  return count % 1000000007
}

test('1524 sample arrays give hand-counted totals', () => {
  assert.equal(solve([1, 2, 3]), 4)
  assert.equal(solve([2, 4, 6]), 0)
  assert.equal(solve([1]), 1)
  assert.equal(solve([100]), 0)
})

test('1524 random arrays match the quadratic oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(14)
    const arr = Array.from({ length: len }, () => 1 + rnd(100))
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})

test('1524 a long array stays within the trace limit and the modulus', () => {
  const arr = Array.from({ length: 200 }, (_, i) => 1 + (i % 100))
  assert.equal(solve(arr), oracle(arr))
  assert.ok(solve(arr) < 1000000007)
})

test('1524 rejects malformed input', () => {
  assert.throws(() => parseInput('{"arr":[1]}'), /array/)
  assert.throws(() => parseInput('[0]'), /1 to 100/)
  assert.throws(() => parseInput('[]'), /1 to 200/)
})
