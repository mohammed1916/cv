import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('1593 official examples', () => {
  assert.equal(solve('ababccc'), 5)
  assert.equal(solve('aba'), 2)
  assert.equal(solve('aa'), 1)
})

test('1593 a single character is one piece', () => {
  assert.equal(solve('z'), 1)
})

test('1593 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"aB"}'), /lowercase/)
})

// Independent oracle: try every subset of cut positions (bitmasks) and keep the best split with unique pieces.
function oracle(s) {
  const n = s.length
  let best = 0
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const pieces = []
    let start = 0
    for (let i = 0; i < n - 1; i++) {
      if (mask & (1 << i)) { pieces.push(s.slice(start, i + 1)); start = i + 1 }
    }
    pieces.push(s.slice(start))
    if (new Set(pieces).size === pieces.length) best = Math.max(best, pieces.length)
  }
  return best
}

test('1593 random strings match a cut-mask oracle', () => {
  let seed = 1593
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(10)
    let s = ''
    for (let i = 0; i < length; i++) s += 'abc'[rnd(3)]
    assert.equal(solve(s), oracle(s), s)
  }
})
