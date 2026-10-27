import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3370 official examples', () => {
  assert.equal(solve(5), 7)
  assert.equal(solve(10), 15)
  assert.equal(solve(3), 3)
})

test('3370 one is already all set bits', () => {
  assert.equal(solve(1), 1)
})

test('3370 rejects zero', () => {
  assert.throws(() => parseInput('{"n":0}'))
})

// Independent oracle: scan upward from n and take the first x where x + 1 is a power of two,
// which is exactly when every bit of x is set.
function oracle(n) {
  let x = n
  while ((x & (x + 1)) !== 0) x++
  return x
}

test('3370 random values match the upward-scan oracle', () => {
  let seed = 3370
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(1000)
    assert.equal(solve(n), oracle(n), `n = ${n}`)
  }
})
