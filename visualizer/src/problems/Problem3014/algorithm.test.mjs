import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = word => buildTrace(parseInput(JSON.stringify({ word }))).result

// Independent oracle: try every order of the distinct letters; the r-th letter in that order costs (r div 8 + 1) presses per use.
function oracle(word) {
  const counts = new Map()
  for (const ch of word) counts.set(ch, (counts.get(ch) || 0) + 1)
  const f = [...counts.values()]
  let best = Infinity
  const permute = (rest, pos, cost) => {
    if (rest.length === 0) { best = Math.min(best, cost); return }
    for (let i = 0; i < rest.length; i++) {
      const next = rest.slice(0, i).concat(rest.slice(i + 1))
      permute(next, pos + 1, cost + rest[i] * (Math.floor(pos / 8) + 1))
    }
  }
  permute(f, 0, 0)
  return best
}

test('3014 examples', () => {
  assert.equal(solve('abcde'), 5)
  assert.equal(solve('xyzxyzx'), 7)
  assert.equal(solve('abcdefghi'), 10)
})

test('3014 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"word":"Ab"}'))
})

test('3014 random words match a permutation oracle', () => {
  let seed = 3014
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 80; t++) {
    const alphabet = 'abcdefghi'.slice(0, 1 + rnd(9))
    const word = Array.from({ length: 1 + rnd(20) }, () => alphabet[rnd(alphabet.length)]).join('')
    assert.equal(solve(word), oracle(word), word)
  }
})
