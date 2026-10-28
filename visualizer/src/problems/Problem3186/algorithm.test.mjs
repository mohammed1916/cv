import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3186 official examples', () => {
  assert.equal(solve([1, 1, 3, 4]), 6)
  assert.equal(solve([7, 1, 6, 6]), 13)
})

test('3186 equal powers can all be cast together', () => {
  assert.equal(solve([5, 5, 5]), 15)
})

test('3186 rejects a power outside 1 to 10', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[11]'))
})

// Independent oracle: try every subset of spells and reject any subset with two powers 1 or 2 apart.
function oracle(power) {
  const n = power.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const chosen = power.filter((_, i) => (mask >> i) & 1)
    let legal = true
    for (const a of chosen) for (const b of chosen) {
      const gap = Math.abs(a - b)
      if (gap === 1 || gap === 2) legal = false
    }
    if (legal) best = Math.max(best, chosen.reduce((sum, v) => sum + v, 0))
  }
  return best
}

test('3186 random inputs match a subset oracle', () => {
  let seed = 3186
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const power = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(10))
    assert.equal(solve(power), oracle(power), JSON.stringify(power))
  }
})
