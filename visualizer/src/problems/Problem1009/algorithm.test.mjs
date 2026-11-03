import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('1009 zero has one digit and complements to one', () => {
  assert.equal(solve(0), 1)
})

test('1009 complements only the written digits', () => {
  assert.equal(solve(5), 2)
  assert.equal(solve(7), 0)
  assert.equal(solve(10), 5)
  assert.equal(solve(128), 127)
})

test('1009 rejects non-integers and out-of-range values', () => {
  assert.throws(() => parseInput('{"n":-1}'), /n must be/)
  assert.throws(() => parseInput('{"n":1.5}'), /n must be/)
})

// Independent oracle: XOR with the smallest all-ones mask that covers n.
function oracle(n) {
  if (n === 0) return 1
  let mask = 1
  while (mask < n) mask = mask * 2 + 1
  return n ^ mask
}

test('1009 random values match a mask oracle', () => {
  let seed = 1009
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(1000001)
    assert.equal(solve(n), oracle(n), `n=${n}`)
  }
})
