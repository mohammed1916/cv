import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, sub, mappings) => buildTrace({ s, sub, mappings }).result

test('2301 worked examples', () => {
  assert.equal(solve('fooleyzbar', 'leet', [['e', 'y'], ['t', 'z'], ['t', 'w']]), true)
  assert.equal(solve('abcd', 'ef', [['e', 'b']]), false)
  assert.equal(solve('ab', 'e', [['e', 'b']]), true)
})

test('2301 an exact match needs no mapping', () => {
  assert.equal(solve('xyz', 'yz', []), true)
  assert.equal(solve('xyz', 'zz', []), false)
})

test('2301 rejects a mapping that is not two single letters', () => {
  assert.throws(() => parseInput('{"s":"ab","sub":"a","mappings":[["ab","c"]]}'))
  assert.throws(() => parseInput('{"s":"ab","sub":"a","mappings":[["a"]]}'))
})

// Independent oracle: a 26 by 26 boolean table of replacements, checked at every window.
function oracle(s, sub, mappings) {
  const code = c => c.charCodeAt(0) - 97
  const table = Array.from({ length: 26 }, () => Array(26).fill(false))
  for (const [from, to] of mappings) table[code(from)][code(to)] = true
  for (let i = 0; i + sub.length <= s.length; i++) {
    let fits = true
    for (let j = 0; j < sub.length && fits; j++) {
      const a = code(sub[j]), b = code(s[i + j])
      fits = a === b || table[a][b]
    }
    if (fits) return true
  }
  return false
}

test('2301 random inputs match a replacement-table oracle', () => {
  let seed = 2301
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcde'
  const word = len => Array.from({ length: len }, () => letters[rnd(letters.length)]).join('')
  for (let t = 0; t < 300; t++) {
    const s = word(1 + rnd(8))
    const sub = word(1 + rnd(4))
    const mappings = Array.from({ length: rnd(6) }, () => [letters[rnd(5)], letters[rnd(5)]])
    assert.equal(solve(s, sub, mappings), oracle(s, sub, mappings), JSON.stringify({ s, sub, mappings }))
  }
})
