import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, dictionary) => buildTrace(parseInput(JSON.stringify({ s, dictionary }))).result

test('2707 official examples', () => {
  // "leet" and "code" cover the string except the extra "s" in the middle.
  assert.equal(solve('leetscode', ['leet', 'code', 'leetcode']), 1)
  assert.equal(solve('sayhelloworld', ['hello', 'world']), 3)
})

test('2707 with no matching word every character is extra', () => {
  assert.equal(solve('abc', ['z']), 3)
})

test('2707 rejects an empty dictionary word', () => {
  assert.throws(() => parseInput('{"s":"ab","dictionary":[""]}'))
})

// Independent oracle: top-down recursion that either leaves a character extra or starts a dictionary word there.
function oracle(s, dictionary) {
  const words = new Set(dictionary)
  const memo = new Map()
  const fewest = i => {
    if (i === s.length) return 0
    if (memo.has(i)) return memo.get(i)
    let best = 1 + fewest(i + 1)
    for (let j = i + 1; j <= s.length; j++) {
      if (words.has(s.slice(i, j))) best = Math.min(best, fewest(j))
    }
    memo.set(i, best)
    return best
  }
  return fewest(0)
}

test('2707 seeded random inputs match a top-down recursion', () => {
  let seed = 2707
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const s = Array.from({ length: 1 + rnd(8) }, () => 'abcdeh'[rnd(6)]).join('')
    const dictionary = Array.from({ length: 1 + rnd(4) }, () => Array.from({ length: 1 + rnd(3) }, () => 'abc'[rnd(3)]).join(''))
    assert.equal(solve(s, dictionary), oracle(s, dictionary), `${s} ${JSON.stringify(dictionary)}`)
  }
})
