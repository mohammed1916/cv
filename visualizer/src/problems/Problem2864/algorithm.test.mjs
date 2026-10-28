import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

// Independent oracle: every distinct rearrangement that ends in 1, keeping the largest (same length, so string order is numeric order).
function oracle(s) {
  const counts = { 0: 0, 1: 0 }
  for (const ch of s) counts[ch] += 1
  const results = []
  const build = prefix => {
    if (prefix.length === s.length) {
      if (prefix.endsWith('1')) results.push(prefix)
      return
    }
    for (const d of ['0', '1']) {
      if (counts[d] > 0) {
        counts[d] -= 1
        build(prefix + d)
        counts[d] += 1
      }
    }
  }
  build('')
  return results.reduce((a, b) => (b > a ? b : a))
}

test('2864 examples', () => {
  assert.equal(solve('010'), '001')
  assert.equal(solve('0101'), '1001')
  assert.equal(solve('1'), '1')
})

test('2864 rejects a string with no one', () => {
  assert.throws(() => parseInput('{"s":"000"}'))
})

test('2864 random strings match a permutation oracle', () => {
  let seed = 2864
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(7)
    let s = Array.from({ length: len }, () => String(rnd(2))).join('')
    if (!s.includes('1')) s = '1' + s.slice(1)
    assert.equal(solve(s), oracle(s), s)
  }
})
