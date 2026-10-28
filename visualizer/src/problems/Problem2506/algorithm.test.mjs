import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2506 official examples', () => {
  assert.equal(solve('{"words":["aba","aabb","abcd","bac","aabc"]}'), 2)
  assert.equal(solve('{"words":["aabb","ab","ba"]}'), 3)
  assert.equal(solve('{"words":["nba","cba","dba"]}'), 0)
})

test('2506 repeats do not change a word’s letter set', () => {
  assert.equal(solve('{"words":["aaa","a"]}'), 1)
})

test('2506 rejects an uppercase letter', () => {
  assert.throws(() => parseInput('{"words":["Ab"]}'))
})

// Independent oracle: two words are similar when each one's letters are all inside the other's.
function oracle(words) {
  let count = 0
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const a = words[i], b = words[j]
      if ([...a].every(ch => b.includes(ch)) && [...b].every(ch => a.includes(ch))) count++
    }
  }
  return count
}

test('2506 random words match a pairwise containment oracle', () => {
  let seed = 2506
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const words = Array.from({ length: 1 + rnd(8) }, () => Array.from({ length: 1 + rnd(4) }, () => 'abc'[rnd(3)]).join(''))
    assert.equal(solve(JSON.stringify({ words })), oracle(words), JSON.stringify(words))
  }
})
