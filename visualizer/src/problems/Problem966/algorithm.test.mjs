import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('966 official example', () => {
  const spec = { wordlist: ['KiTe', 'kite', 'hare', 'Hare'], queries: ['kite', 'Kite', 'KiTe', 'Hare', 'HARE', 'Hear', 'hear', 'keti', 'keet', 'keto'] }
  assert.deepEqual(buildTrace(spec).result, ['kite', 'KiTe', 'KiTe', 'Hare', 'hare', '', '', 'KiTe', '', 'KiTe'])
})

test('966 rules are tried in order', () => {
  // The exact match wins over the case-insensitive match that comes first in the list.
  assert.deepEqual(buildTrace({ wordlist: ['abc', 'ABC'], queries: ['ABC'] }).result, ['ABC'])
})

test('966 rejects non-letter words', () => {
  assert.throws(() => parseInput('{"wordlist":["a1"],"queries":["a"]}'))
})

// Independent oracle: scan the list for each rule instead of building lookup tables.
function oracle({ wordlist, queries }) {
  const vowelFree = s => s.toLowerCase().split('').map(ch => ('aeiou'.includes(ch) ? '*' : ch)).join('')
  return queries.map(q => {
    const exact = wordlist.find(w => w === q)
    if (exact !== undefined) return exact
    const caseless = wordlist.find(w => w.toLowerCase() === q.toLowerCase())
    if (caseless !== undefined) return caseless
    const vowelless = wordlist.find(w => vowelFree(w) === vowelFree(q))
    return vowelless ?? ''
  })
}

test('966 random words match a linear-scan oracle', () => {
  let seed = 47
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'aeAEbB'
  const word = () => Array.from({ length: 1 + rnd(3) }, () => alphabet[rnd(alphabet.length)]).join('')
  for (let t = 0; t < 300; t++) {
    const spec = { wordlist: Array.from({ length: 1 + rnd(6) }, word), queries: Array.from({ length: 1 + rnd(6) }, word) }
    assert.deepEqual(buildTrace(spec).result, oracle(spec), JSON.stringify(spec))
  }
})
