import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('1326 official examples', () => {
  assert.equal(solve({ n: 5, ranges: [3, 4, 1, 1, 0, 0] }), 1)
  assert.equal(solve({ n: 3, ranges: [0, 0, 0, 0] }), -1)
  assert.equal(solve({ n: 7, ranges: [1, 2, 1, 0, 2, 1, 0, 1] }), 3)
})

test('1326 a tap that reaches only one side leaves the garden unwatered', () => {
  assert.equal(solve({ n: 2, ranges: [2, 0, 0] }), 1)
  assert.equal(solve({ n: 2, ranges: [0, 1, 0] }), 1)
  assert.equal(solve({ n: 2, ranges: [0, 0, 1] }), -1)
})

test('1326 rejects a ranges array of the wrong length', () => {
  assert.throws(() => parseInput(JSON.stringify({ n: 3, ranges: [1, 2] })))
})

// Independent oracle: try every subset of taps and check that each unit segment of the garden is watered.
function oracle({ n, ranges }) {
  let best = -1
  for (let mask = 0; mask < (1 << ranges.length); mask++) {
    let count = 0
    for (let b = mask; b; b &= b - 1) count++
    if (best !== -1 && count >= best) continue
    let covers = true
    for (let t = 0; t < n && covers; t++) {
      covers = ranges.some((r, i) => (mask & (1 << i)) && i - r <= t && i + r >= t + 1)
    }
    if (covers) best = count
  }
  return best
}

test('1326 random gardens match a subset-enumeration oracle', () => {
  let seed = 1326
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const input = { n, ranges: Array.from({ length: n + 1 }, () => rnd(5)) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
