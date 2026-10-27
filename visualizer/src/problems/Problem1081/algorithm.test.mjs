import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('1081 official examples', () => {
  assert.equal(solve('bcabc'), 'abc')
  assert.equal(solve('cbacdcbc'), 'acdb')
})

test('1081 edge cases', () => {
  assert.equal(solve('a'), 'a')
  assert.equal(solve('abcd'), 'abcd')
  assert.equal(solve('zyx'), 'zyx')
})

test('1081 rejects uppercase and empty input', () => {
  assert.throws(() => parseInput('{"s":"aB"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

// Independent oracle: try every subsequence that uses each distinct letter exactly once, keep the smallest.
function oracle(s) {
  const distinct = [...new Set(s)].length
  let best = null
  for (let mask = 1; mask < 1 << s.length; mask++) {
    let word = ''
    for (let i = 0; i < s.length; i++) if (mask & (1 << i)) word += s[i]
    if (new Set(word).size !== word.length || word.length !== distinct) continue
    if (best === null || word < best) best = word
  }
  return best
}

test('1081 random strings match a subset-enumeration oracle', () => {
  let seed = 1081
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let s = ''
    const len = 1 + rnd(11)
    for (let i = 0; i < len; i++) s += 'abcde'[rnd(5)]
    assert.equal(solve(s), oracle(s), s)
  }
})
