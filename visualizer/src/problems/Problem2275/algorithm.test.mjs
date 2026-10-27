import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = candidates => buildTrace(parseInput(JSON.stringify({ candidates }))).result

test('2275 official examples', () => {
  assert.equal(solve([16, 17, 71, 62, 12, 24, 14]), 4)
  assert.equal(solve([8, 8]), 2)
})

test('2275 a single candidate and a zero-free set', () => {
  assert.equal(solve([5]), 1)
  assert.equal(solve([1, 2, 4]), 1)
})

test('2275 rejects zero and oversized values', () => {
  assert.throws(() => parseInput('{"candidates":[0]}'))
  assert.throws(() => parseInput('{"candidates":[1000001]}'))
})

// Independent oracle: try every non-empty subset and keep the largest one whose AND is above zero.
function oracle(values) {
  let best = 0
  for (let mask = 1; mask < 1 << values.length; mask++) {
    let and = -1
    let size = 0
    for (let i = 0; i < values.length; i++) if (mask & (1 << i)) { and &= values[i]; size++ }
    if (and > 0 && size > best) best = size
  }
  return best
}

test('2275 random arrays match a subset-enumeration oracle', () => {
  let seed = 2275
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(63))
    assert.equal(solve(values), oracle(values), JSON.stringify(values))
  }
})
