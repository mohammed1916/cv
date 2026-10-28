import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3545 worked examples', () => {
  assert.equal(solve({ s: 'aabbcc', k: 1 }), 4)
  assert.equal(solve({ s: 'abcabc', k: 3 }), 0)
  assert.equal(solve({ s: 'aaabbc', k: 2 }), 1)
})

test('3545 a single letter with k zero deletes everything', () => {
  assert.equal(solve({ s: 'a', k: 0 }), 1)
})

test('3545 rejects uppercase letters and k above 26', () => {
  assert.throws(() => parseInput('{"s":"AB","k":1}'))
  assert.throws(() => parseInput('{"s":"ab","k":27}'))
})

// Independent oracle: try every set of at most k letters and keep the set that preserves the most characters.
function oracle({ s, k }) {
  const letters = [...new Set(s)]
  let best = 0
  for (let mask = 0; mask < 1 << letters.length; mask++) {
    const chosen = letters.filter((_, i) => mask & (1 << i))
    if (chosen.length > k) continue
    best = Math.max(best, [...s].filter(ch => chosen.includes(ch)).length)
  }
  return s.length - best
}

test('3545 random strings match a letter-subset oracle', () => {
  let seed = 3545
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const letters = 'abcdef'.slice(0, 1 + rnd(6))
    let s = ''
    const len = 1 + rnd(14)
    for (let i = 0; i < len; i++) s += letters[rnd(letters.length)]
    const k = rnd(7)
    assert.equal(solve({ s, k }), oracle({ s, k }), JSON.stringify({ s, k }))
  }
})
