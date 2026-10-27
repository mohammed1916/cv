import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1286 official example', () => {
  assert.deepEqual(solve({ characters: 'abc', combination_length: 2 }), ['ab', 'ac', 'bc'])
})

test('1286 a full-length combination yields only the whole string', () => {
  assert.deepEqual(solve({ characters: 'xy', combination_length: 2 }), ['xy'])
})

test('1286 rejects unsorted characters', () => {
  assert.throws(() => parseInput('{"characters":"ba","combination_length":1}'))
})

// Independent oracle: keep every subset of positions with the right size, build the strings, and sort them.
function oracle({ characters, combination_length: k }) {
  const n = characters.length
  const found = []
  for (let mask = 0; mask < 1 << n; mask++) {
    let s = ''
    for (let i = 0; i < n; i++) if (mask & (1 << i)) s += characters[i]
    if (s.length === k) found.push(s)
  }
  return found.sort()
}

test('1286 seeded random inputs match a sorted-subsets oracle', () => {
  let seed = 1286
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const letters = 'abcdef'.split('').filter(() => rnd(2) === 1).join('') || 'a'
    const input = { characters: letters, combination_length: 1 + rnd(letters.length) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
