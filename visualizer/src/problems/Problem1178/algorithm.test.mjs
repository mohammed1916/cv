import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1178 official examples', () => {
  assert.deepEqual(solve({
    words: ['aaaa', 'asas', 'able', 'ability', 'actt', 'actor', 'access'],
    puzzles: ['aboveyz', 'abrodyz', 'abslute', 'absoryz', 'actresz', 'gaswxyz'],
  }), [1, 1, 3, 2, 4, 0])
})

test('1178 a word must contain the first letter of the puzzle', () => {
  // "bcd" uses only letters of the puzzle but lacks its first letter a.
  assert.deepEqual(solve({ words: ['bcd', 'abc'], puzzles: ['abcdefg'] }), [1])
})

test('1178 rejects a puzzle that is not seven distinct letters', () => {
  assert.throws(() => parseInput(JSON.stringify({ words: ['a'], puzzles: ['aabcdef'] })))
  assert.throws(() => parseInput(JSON.stringify({ words: ['a'], puzzles: ['abcdef'] })))
})

// Independent oracle: test every word against every puzzle directly, without bitmasks.
function oracle({ words, puzzles }) {
  return puzzles.map(p => words.filter(w => w.includes(p[0]) && [...w].every(ch => p.includes(ch))).length)
}

test('1178 random inputs match a direct word-by-word oracle', () => {
  let seed = 1178
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const word = () => Array.from({ length: 1 + rnd(5) }, () => letters[rnd(11)]).join('')
  const puzzle = () => {
    const pool = [...letters]
    const out = []
    while (out.length < 7) out.push(pool.splice(rnd(pool.length), 1)[0])
    return out.join('')
  }
  for (let t = 0; t < 300; t++) {
    const input = { words: Array.from({ length: 1 + rnd(8) }, word), puzzles: Array.from({ length: 1 + rnd(4) }, puzzle) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
