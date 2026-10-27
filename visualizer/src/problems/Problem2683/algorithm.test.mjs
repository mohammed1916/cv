import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = derived => buildTrace(parseInput(JSON.stringify({ derived }))).result

test('2683 official examples', () => {
  assert.equal(solve([1, 1]), true)
  assert.equal(solve([1, 0]), false)
  assert.equal(solve([0, 1]), false)
})

test('2683 a single zero needs original zero', () => {
  assert.equal(solve([0]), true)
  assert.equal(solve([1]), false)
})

test('2683 rejects a value other than 0 or 1', () => {
  assert.throws(() => parseInput('{"derived":[2]}'))
})

// Independent oracle: try every binary original array and check the circular neighbor xors.
function oracle(derived) {
  const n = derived.length
  for (let mask = 0; mask < 2 ** n; mask++) {
    const original = Array.from({ length: n }, (_, i) => (mask >> i) & 1)
    if (derived.every((d, i) => d === (original[i] ^ original[(i + 1) % n]))) return true
  }
  return false
}

test('2683 random arrays match the exhaustive oracle', () => {
  let seed = 2683
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const derived = Array.from({ length: 1 + rnd(10) }, () => rnd(2))
    assert.equal(solve(derived), oracle(derived), JSON.stringify(derived))
  }
})
