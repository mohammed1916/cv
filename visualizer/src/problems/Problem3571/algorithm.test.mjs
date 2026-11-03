import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (first, second) => buildTrace(parseInput(JSON.stringify({ first, second }))).result

test('3571 overlapping and disjoint words', () => {
  assert.equal(solve('abc', 'bcd'), 'abcd')
  assert.equal(solve('ab', 'cd'), 'abcd')
  assert.equal(solve('cd', 'ab'), 'abcd')
})

test('3571 containment returns the longer word', () => {
  assert.equal(solve('abcde', 'cd'), 'abcde')
  assert.equal(solve('cd', 'abcde'), 'abcde')
  assert.equal(solve('aa', 'aa'), 'aa')
})

test('3571 equal lengths break ties alphabetically', () => {
  assert.equal(solve('ab', 'ba'), 'aba')
  assert.equal(solve('ba', 'ab'), 'aba')
})

test('3571 rejects empty or uppercase words', () => {
  assert.throws(() => parseInput('{"first":"","second":"a"}'))
  assert.throws(() => parseInput('{"first":"Ab","second":"a"}'))
})

// Independent oracle: enumerate every string over the letters used, in length then lexicographic order,
// and return the first one containing both words.
function oracle(first, second) {
  const letters = [...new Set(first + second)].sort()
  const minLen = Math.max(first.length, second.length)
  for (let len = minLen; len <= first.length + second.length; len++) {
    const digits = Array(len).fill(0)
    for (;;) {
      const s = digits.map(d => letters[d]).join('')
      if (s.includes(first) && s.includes(second)) return s
      let p = len - 1
      while (p >= 0 && digits[p] === letters.length - 1) digits[p--] = 0
      if (p < 0) break
      digits[p]++
    }
  }
  return null
}

test('3571 random words match the enumeration oracle', () => {
  let seed = 3571
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const word = () => Array.from({ length: 1 + rnd(4) }, () => 'ab'[rnd(2)]).join('')
  for (let t = 0; t < 200; t++) {
    const first = word()
    const second = word()
    assert.equal(solve(first, second), oracle(first, second), JSON.stringify({ first, second }))
  }
})

test('3571 frames keep their pseudocode and python lines in range', () => {
  const run = buildTrace(parseInput('{"first":"abab","second":"bab"}'))
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= 11)
    assert.ok(f.pythonLine >= 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
