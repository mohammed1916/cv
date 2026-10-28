import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('2309 official examples', () => {
  assert.equal(solve('lEeTcOdE'), 'E')
  assert.equal(solve('arRAzFif'), 'R')
  assert.equal(solve('AbCdEfGhIjK'), '')
})

test('2309 edge cases: a single letter is never in both cases', () => {
  assert.equal(solve('a'), '')
  assert.equal(solve('aA'), 'A')
})

test('2309 rejects digits and empty strings', () => {
  assert.throws(() => parseInput('{"s":"ab1"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

// Independent oracle: test each letter from Z down to A with plain substring searches.
function oracle(s) {
  for (let code = 90; code >= 65; code--) {
    const upper = String.fromCharCode(code)
    if (s.includes(upper) && s.includes(upper.toLowerCase())) return upper
  }
  return ''
}

test('2309 random strings match a substring-search oracle', () => {
  let seed = 2309
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(12) }, () => 'aBcDeFgz'[rnd(8)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
