import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: scan the keyboard string for each typed letter, without any position map.
function oracle(keyboard, word) {
  let current = 0
  let total = 0
  for (const letter of word) {
    const p = keyboard.indexOf(letter)
    total += Math.abs(p - current)
    current = p
  }
  return total
}

const REVERSED = 'zyxwvutsrqponmlkjihgfedcba'

test('reversed keyboard with the word abca costs 29', () => {
  assert.equal(buildTrace({ keyboard: REVERSED, word: 'abca' }).result, 29)
})

test('repeated presses cost nothing and the first key is measured from position 0', () => {
  assert.equal(buildTrace({ keyboard: REVERSED, word: 'aaa' }).result, 25)
  assert.equal(buildTrace({ keyboard: REVERSED, word: 'z' }).result, 0)
})

test('random permutations and words agree with the oracle', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
    for (let i = letters.length - 1; i > 0; i--) { const j = rand(i + 1); [letters[i], letters[j]] = [letters[j], letters[i]] }
    const keyboard = letters.join('')
    const length = 1 + rand(30)
    const word = Array.from({ length }, () => keyboard[rand(26)]).join('')
    assert.equal(buildTrace({ keyboard, word }).result, oracle(keyboard, word), `${keyboard} ${word}`)
  }
})

test('every frame has a phase from the list, a code line, a message and a snapshot', () => {
  const run = buildTrace({ keyboard: REVERSED, word: 'abca' })
  const ids = ['setup', 'map', 'walk', 'done']
  for (const frame of run.frames) {
    assert.ok(ids.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 7)
    assert.ok(frame.message.length > 5)
    assert.ok(frame.snapshot && typeof frame.snapshot === 'object')
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).snapshot.total, 29)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[]'), /JSON object/)
  assert.throws(() => parseInput({ keyboard: 'abc', word: 'a' }), /26 different/)
  assert.throws(() => parseInput({ keyboard: 'a'.repeat(26), word: 'a' }), /26 different/)
  assert.throws(() => parseInput({ keyboard: REVERSED, word: '' }), /word must be/)
  assert.throws(() => parseInput({ keyboard: REVERSED, word: 'A' }), /word must be/)
})
