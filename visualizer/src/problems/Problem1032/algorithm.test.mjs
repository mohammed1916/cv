import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

function seeded(seed) {
  let s = seed
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}
const randomWord = (rnd, max) => Array.from({ length: 1 + Math.floor(rnd() * max) }, () => 'abc'[Math.floor(rnd() * 3)]).join('')

// Oracle: a word is a current suffix of the prefix streamed so far.
function oracle(words, letters) {
  return [...letters].map((_, i) => words.some(w => letters.slice(0, i + 1).endsWith(w)))
}

test('phases are well formed', () => {
  assert.ok(phases.length >= 3)
  for (const p of phases) assert.ok(p.id && p.label && p.description)
})

test('sample stream reports suffix matches', () => {
  assert.deepEqual(buildTrace({ words: ['ab', 'cd', 'bcd'], letters: 'xabcd' }).result, [false, false, true, false, true])
})

test('matches suffix oracle on random inputs', () => {
  const rnd = seeded(5)
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + Math.floor(rnd() * 6) }, () => randomWord(rnd, 4))
    const letters = Array.from({ length: 1 + Math.floor(rnd() * 25) }, () => 'abc'[Math.floor(rnd() * 3)]).join('')
    assert.deepEqual(buildTrace({ words, letters }).result, oracle(words, letters), JSON.stringify({ words, letters }))
  }
})

test('every frame has phase, activeLine, message and snapshot', () => {
  const run = buildTrace({ words: ['ab'], letters: 'ab' })
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.equal(typeof f.activeLine, 'number')
    assert.equal(typeof f.message, 'string')
    assert.ok(f.snapshot && typeof f.snapshot === 'object')
  }
})

test('parser validates words and letters', () => {
  assert.throws(() => parseInput('{"words":["Ab"],"letters":"a"}'))
  assert.throws(() => parseInput('{"words":[],"letters":"a"}'))
  assert.throws(() => parseInput('{"words":["a"],"letters":"A"}'))
  assert.deepEqual(parseInput('{"words":["a"],"letters":"ba"}'), { words: ['a'], letters: 'ba' })
})
