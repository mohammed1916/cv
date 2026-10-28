import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('2430 official examples', () => {
  assert.equal(solve('abcabcdabc'), 2)
  assert.equal(solve('aaabaab'), 4)
  assert.equal(solve('aaaaa'), 5)
})

test('2430 edge cases: one letter and no repeats', () => {
  assert.equal(solve('a'), 1)
  assert.equal(solve('abc'), 1)
})

test('2430 rejects an empty string and uppercase letters', () => {
  assert.throws(() => parseInput('{"s":""}'))
  assert.throws(() => parseInput('{"s":"AB"}'))
})

// Independent oracle: exhaustive search over every sequence of legal operations, with no memoisation.
function oracle(s) {
  let best = 0
  const explore = (rest, count) => {
    best = Math.max(best, count + 1)
    for (let i = 1; 2 * i <= rest.length; i++) {
      if (rest.slice(0, i) === rest.slice(i, 2 * i)) explore(rest.slice(i), count + 1)
    }
  }
  explore(s, 0)
  return best
}

test('2430 random strings match an exhaustive search of operation sequences', () => {
  let seed = 2430
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    let s = ''
    const len = 1 + rnd(10)
    for (let i = 0; i < len; i++) s += 'abc'[rnd(3)]
    assert.equal(solve(s), oracle(s), s)
  }
})
