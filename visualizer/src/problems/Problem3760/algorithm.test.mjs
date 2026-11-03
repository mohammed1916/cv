import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('3760 worked examples', () => {
  assert.equal(solve('abab'), 2)
  assert.equal(solve('abcd'), 4)
  assert.equal(solve('aaaa'), 1)
})

test('3760 rejects input outside lowercase letters', () => {
  assert.throws(() => parseInput('{"s":"AB"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

// Oracle: try every set of cut positions and keep the largest valid split.
function oracle(s) {
  let best = 0
  for (let mask = 0; mask < 1 << (s.length - 1); mask++) {
    const starts = new Set([s[0]])
    let ok = true
    let count = 1
    for (let i = 1; i < s.length && ok; i++) {
      if ((mask >> (i - 1)) & 1) {
        if (starts.has(s[i])) ok = false
        else { starts.add(s[i]); count++ }
      }
    }
    if (ok) best = Math.max(best, count)
  }
  return best
}

test('3760 random strings match the cut-enumeration oracle', () => {
  let seed = 3760
  const next = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  for (let t = 0; t < 300; t++) {
    const len = 1 + Math.floor(next() * 10)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abcd'[Math.floor(next() * 4)]
    assert.equal(solve(s), oracle(s), s)
  }
})
