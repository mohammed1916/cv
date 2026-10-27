import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (z, operation) => buildTrace(parseInput(JSON.stringify({ z, operation }))).result

test('1237 official examples', () => {
  assert.deepEqual(solve(5, 'sum'), [[1, 4], [2, 3], [3, 2], [4, 1]])
  assert.deepEqual(solve(5, 'product'), [[1, 5], [5, 1]])
})

test('1237 no pair when z is too small for sum', () => {
  assert.deepEqual(solve(1, 'sum'), [])
})

test('1237 rejects an unknown operation', () => {
  assert.throws(() => parseInput('{"z":5,"operation":"max"}'))
})

// Independent oracle: test every pair in the box 1..z by brute force.
function oracle(z, operation) {
  const out = []
  for (let x = 1; x <= z; x++) {
    for (let y = 1; y <= z; y++) {
      const v = operation === 'sum' ? x + y : x * y
      if (v === z) out.push([x, y])
    }
  }
  return out
}

test('1237 random inputs match a brute-force oracle', () => {
  let seed = 1237
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const z = 1 + rnd(60)
    const operation = rnd(2) ? 'sum' : 'product'
    assert.deepEqual(solve(z, operation), oracle(z, operation), `${z} ${operation}`)
  }
})
