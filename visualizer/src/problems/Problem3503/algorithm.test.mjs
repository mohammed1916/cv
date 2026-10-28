import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, t) => buildTrace(parseInput(JSON.stringify({ s, t }))).result

test('3503 official examples', () => {
  assert.equal(solve('a', 'a'), 2)
  assert.equal(solve('abc', 'def'), 1)
  assert.equal(solve('b', 'aaaa'), 4)
  assert.equal(solve('abcde', 'ecdba'), 5)
})

test('3503 one piece alone can be the whole palindrome', () => {
  assert.equal(solve('xyz', 'q'), 1)
})

test('3503 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"","t":"a"}'))
  assert.throws(() => parseInput('{"s":"AB","t":"a"}'))
})

// Independent oracle: enumerate every pair of substrings by start and end index and test the joined
// string against its reverse.
function oracle(s, t) {
  let best = 0
  for (let a = 0; a <= s.length; a++) for (let b = a; b <= s.length; b++) {
    const x = s.slice(a, b)
    for (let c = 0; c <= t.length; c++) for (let d = c; d <= t.length; d++) {
      const joined = x + t.slice(c, d)
      if (joined === [...joined].reverse().join('')) best = Math.max(best, joined.length)
    }
  }
  return best
}

test('3503 random strings match an index-based oracle', () => {
  let seed = 3503
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 200; t++) {
    const s = word(1 + rnd(8))
    const u = word(1 + rnd(8))
    assert.equal(solve(s, u), oracle(s, u), `${s} ${u}`)
  }
})
