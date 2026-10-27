import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (start_pos, end_pos, k) => buildTrace(parseInput(JSON.stringify({ start_pos, end_pos, k }))).result

test('2400 examples', () => {
  assert.equal(solve(1, 2, 3), 3)
  assert.equal(solve(2, 5, 10), 0)
})

test('2400 edge cases', () => {
  assert.equal(solve(4, 4, 2), 2)
  assert.equal(solve(1, 40, 3), 0)
})

test('2400 rejects bad input', () => {
  assert.throws(() => parseInput('{"start_pos":0,"end_pos":2,"k":3}'))
  assert.throws(() => parseInput('{"start_pos":1,"end_pos":2,"k":41}'))
})

// Independent oracle: try every sign sequence of length k and count those whose sum reaches the displacement.
function oracle(start, end, k) {
  let count = 0
  for (let mask = 0; mask < 2 ** k; mask++) {
    let pos = start
    for (let i = 0; i < k; i++) pos += mask & (1 << i) ? 1 : -1
    if (pos === end) count++
  }
  return count
}

test('2400 random cases match sign-sequence enumeration', () => {
  let seed = 2400
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const start = 1 + rnd(20)
    const end = 1 + rnd(20)
    const k = 1 + rnd(12)
    assert.equal(solve(start, end, k), oracle(start, end, k), JSON.stringify({ start, end, k }))
  }
})
