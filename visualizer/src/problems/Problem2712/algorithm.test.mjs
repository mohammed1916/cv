import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(s).result

test('2712 official examples', () => {
  assert.equal(solve('0011'), 2)
  assert.equal(solve('010101'), 9)
})

test('2712 equal characters cost nothing', () => {
  assert.equal(solve('1'), 0)
  assert.equal(solve('1111'), 0)
})

test('2712 rejects characters other than 0 and 1', () => {
  assert.throws(() => parseInput('"012"'))
})

// Independent oracle: try every subset of prefix and suffix flips and keep the cheapest uniform result.
function oracle(s) {
  const n = s.length
  let best = Infinity
  for (let mask = 0; mask < 1 << (2 * n); mask++) {
    const bits = [...s].map(Number)
    let cost = 0
    for (let k = 0; k < n; k++) {
      if (mask & (1 << k)) {
        cost += k + 1
        for (let t = 0; t <= k; t++) bits[t] ^= 1
      }
      if (mask & (1 << (n + k))) {
        cost += n - k
        for (let t = k; t < n; t++) bits[t] ^= 1
      }
    }
    if (bits.every(b => b === bits[0]) && cost < best) best = cost
  }
  return best
}

test('2712 random strings match the flip-subset oracle', () => {
  let seed = 2712
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const len = 1 + rnd(7)
    let s = ''
    for (let i = 0; i < len; i++) s += rnd(2)
    assert.equal(solve(s), oracle(s), s)
  }
})
