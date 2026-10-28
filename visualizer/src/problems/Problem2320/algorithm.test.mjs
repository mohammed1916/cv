import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2320 official examples', () => {
  assert.equal(solve(1), 4)
  assert.equal(solve(2), 9)
  assert.equal(solve(3), 25)
})

test('2320 rejects zero plots and non-integers', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('2.5'))
})

// Independent oracle: enumerate every subset of plots on one side, keep those with no two neighbours, and square.
function oracle(n) {
  const MOD = 1000000007n
  let side = 0n
  for (let mask = 0; mask < 1 << n; mask++) {
    if ((mask & (mask >> 1)) === 0) side++
  }
  return Number((side * side) % MOD)
}

test('2320 random plot counts match a bitmask oracle', () => {
  let seed = 2320
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(12)
    assert.equal(solve(n), oracle(n), `n=${n}`)
  }
})
