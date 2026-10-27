import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, s1, s2, evil) => buildTrace(parseInput(JSON.stringify({ n, s1, s2, evil }))).result

test('1397 hand-checked examples', () => {
  // Strings from "aa" to "da" that avoid "b": aa, ac, ..., da, skipping any containing b.
  assert.equal(solve(2, 'aa', 'da', 'b'), 51)
  // The only string in range is "abc" itself, and it contains the evil string.
  assert.equal(solve(3, 'abc', 'abc', 'abc'), 0)
  assert.equal(solve(2, 'ab', 'ab', 'a'), 0)
  assert.equal(solve(1, 'a', 'c', 'z'), 3)
})

test('1397 the evil string may overlap itself', () => {
  assert.equal(solve(3, 'aaa', 'aaa', 'aa'), 0)
})

test('1397 rejects s1 greater than s2', () => {
  assert.throws(() => parseInput('{"n":2,"s1":"ba","s2":"ab","evil":"x"}'))
})

// Independent oracle: enumerate every string of length n over a-z and test the three conditions directly.
function oracle(n, s1, s2, evil) {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  let count = 0
  const build = (prefix) => {
    if (prefix.length === n) {
      if (prefix >= s1 && prefix <= s2 && !prefix.includes(evil)) count++
      return
    }
    for (const ch of letters) build(prefix + ch)
  }
  build('')
  return count % 1000000007
}

test('1397 random inputs match a brute-force enumeration oracle', () => {
  let seed = 1397
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abcdefghijklmnopqrstuvwxyz'[rnd(26)]).join('')
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(3)
    let a = word(n)
    let b = word(n)
    if (a > b) [a, b] = [b, a]
    const evil = word(1 + rnd(3))
    assert.equal(solve(n, a, b, evil), oracle(n, a, b, evil), JSON.stringify({ n, a, b, evil }))
  }
})
