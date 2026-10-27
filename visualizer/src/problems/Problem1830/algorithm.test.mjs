import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('1830 official examples', () => {
  assert.equal(solve('cba'), 5)
  assert.equal(solve('aabaa'), 2)
})

test('1830 sorted and single-letter strings need no operations', () => {
  assert.equal(solve('a'), 0)
  assert.equal(solve('abc'), 0)
  assert.equal(solve('aaa'), 0)
})

test('1830 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":""}'))
  assert.throws(() => parseInput('{"s":"AB"}'))
  assert.throws(() => parseInput('{"s":"abcdefghi"}'))
})

// Independent oracle: list every distinct arrangement of the letters and count those that sort before s.
function oracle(s) {
  const found = new Set()
  const build = (prefix, rest) => {
    if (rest.length === 0) { found.add(prefix); return }
    for (let i = 0; i < rest.length; i++) {
      if (i > 0 && rest[i] === rest[i - 1]) continue
      build(prefix + rest[i], rest.slice(0, i) + rest.slice(i + 1))
    }
  }
  build('', [...s].sort().join(''))
  return [...found].filter(t => t < s).length
}

test('1830 random strings match the arrangement-list oracle', () => {
  let seed = 1830
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(6)
    const s = Array.from({ length }, () => 'abcd'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s) % 1000000007, s)
  }
})
