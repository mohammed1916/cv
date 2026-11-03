import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function reference(words, chars) {
  const supply = {}
  for (const c of chars) supply[c] = (supply[c] || 0) + 1
  return words.reduce((sum, w) => {
    const need = {}
    for (const c of w) need[c] = (need[c] || 0) + 1
    return Object.keys(need).every(c => need[c] <= (supply[c] || 0)) ? sum + w.length : sum
  }, 0)
}

test('three words share the full supply each time', () => {
  assert.equal(buildTrace({ words: ['ab', 'bc', 'abc'], chars: 'abcc' }).result, 7)
})

test('a missing repeated letter rejects the word', () => {
  assert.equal(buildTrace({ words: ['aa', 'b'], chars: 'a' }).result, 0)
})

test('a word with a repeated letter that fits exactly is accepted', () => {
  assert.equal(buildTrace({ words: ['xyz', 'xyzz'], chars: 'xyzy' }).result, 3)
})

test('matches the reference on random inputs', () => {
  let seed = 5
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  const letters = 'abcde'
  for (let t = 0; t < 200; t++) {
    const words = Array.from({ length: 1 + rand(6) }, () => Array.from({ length: 1 + rand(6) }, () => letters[rand(5)]).join(''))
    const chars = Array.from({ length: 1 + rand(20) }, () => letters[rand(5)]).join('')
    assert.equal(buildTrace({ words, chars }).result, reference(words, chars), JSON.stringify({ words, chars }))
  }
})

test('invalid inputs are rejected', () => {
  assert.throws(() => parseInput('{"words":["AB"],"chars":"ab"}'), /lowercase/)
  assert.throws(() => parseInput('{"words":[],"chars":"ab"}'), /1 to 6/)
  assert.throws(() => parseInput('[]'), /words/)
})

test('frames are phased and point at valid code lines', () => {
  const run = buildTrace({ words: ['ab', 'ba'], chars: 'a' })
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 9)
  assert.equal(run.frames.at(-1).phase, 'done')
})
