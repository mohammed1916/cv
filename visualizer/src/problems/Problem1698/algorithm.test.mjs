import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: count distinct substrings length by length, without the trace's loop order.
function oracle(s) {
  let total = 0
  for (let length = 1; length <= s.length; length++) {
    const distinct = new Set()
    for (let at = 0; at + length <= s.length; at++) distinct.add(s.substring(at, at + length))
    total += distinct.size
  }
  return total
}

function randomWord(length, seed, alphabet) {
  let state = seed
  let out = ''
  for (let i = 0; i < length; i++) {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    out += alphabet[state % alphabet.length]
  }
  return out
}

test('1698 known small words', () => {
  assert.equal(buildTrace('aaa').result, 3)
  assert.equal(buildTrace('abc').result, 6)
  assert.equal(buildTrace('abab').result, 7)
  assert.equal(buildTrace('z').result, 1)
})

test('1698 random words over several alphabets match the oracle', () => {
  for (const alphabet of ['ab', 'abc', 'abcdefghijklmnopqrstuvwxyz']) {
    for (let n = 1; n <= 30; n += 3) {
      const word = randomWord(n, n * 31 + alphabet.length, alphabet)
      const run = buildTrace(word)
      assert.equal(run.result, oracle(word), word)
      assert.equal(run.frames.at(-1).snapshot.result, run.result)
    }
  }
})

test('1698 each substring is visited once and the count never falls', () => {
  const word = 'banana'
  const run = buildTrace(word)
  const picks = run.frames.filter(frame => frame.phase === 'pick')
  assert.equal(picks.length, (word.length * (word.length + 1)) / 2)
  let previous = 0
  for (const frame of run.frames) {
    assert.ok(frame.snapshot.count >= previous)
    previous = frame.snapshot.count
  }
  const used = new Set(run.frames.map(frame => frame.phase))
  for (const phase of phases) assert.ok(used.has(phase.id), phase.id)
})

test('1698 input validation', () => {
  assert.equal(parseInput('"abab"'), 'abab')
  for (const text of ['"AB"', '"a1"', '""', '5', '"a b"', JSON.stringify('a'.repeat(31)), 'nope']) {
    assert.throws(() => parseInput(text))
  }
})
