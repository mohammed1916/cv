import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

function oracle(s) {
  let good = 0
  for (let i = 1; i < s.length; i++) {
    const left = new Set(s.slice(0, i)).size
    const right = new Set(s.slice(i)).size
    if (left === right) good++
  }
  return good
}

test('1525 sample strings give hand-counted splits', () => {
  assert.equal(solve('abcabc'), 1)
  assert.equal(solve('aaaa'), 3)
  assert.equal(solve('ab'), 1)
  assert.equal(solve('a'), 0)
})

test('1525 every lowercase-free pattern up to length 12 matches the oracle', () => {
  for (let len = 1; len <= 12; len++) {
    for (let mask = 0; mask < (1 << len); mask++) {
      let s = ''
      for (let b = 0; b < len; b++) s += (mask >> b) & 1 ? 'a' : 'b'
      assert.equal(solve(s), oracle(s), s)
    }
  }
})

test('1525 mixed-letter strings match the oracle', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(40)
    const s = Array.from({ length: len }, () => 'abcdefgh'[rnd(8)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('1525 rejects malformed input', () => {
  assert.throws(() => parseInput(''), /1 to 200/)
  assert.throws(() => parseInput('ab1'), /lowercase/)
  assert.throws(() => parseInput('a'.repeat(201)), /1 to 200/)
})
