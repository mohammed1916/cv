import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = word => buildTrace(parseInput(JSON.stringify({ word }))).result

test('3557 official examples', () => {
  assert.equal(solve('abcdeafdef'), 2)
  assert.equal(solve('bcdaaaab'), 1)
})

test('3557 substrings shorter than four letters do not count', () => {
  assert.equal(solve('abca'), 1)
  assert.equal(solve('abc'), 0)
})

test('3557 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"word":"abcA"}'))
})

// Independent oracle: enumerate every set of intervals by backtracking and keep the largest set that does not overlap.
function oracle(word) {
  const intervals = []
  for (let i = 0; i < word.length; i++) {
    for (let j = i + 3; j < word.length; j++) if (word[i] === word[j]) intervals.push([i, j])
  }
  let best = 0
  const pick = (index, lastEnd, count) => {
    best = Math.max(best, count)
    for (let k = index; k < intervals.length; k++) {
      const [s, e] = intervals[k]
      if (s > lastEnd) pick(k + 1, e, count + 1)
    }
  }
  pick(0, -1, 0)
  return best
}

test('3557 random words match a backtracking oracle', () => {
  let seed = 3557
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 200; trial++) {
    const len = 1 + rnd(12)
    const word = Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(word), oracle(word), word)
  }
})
