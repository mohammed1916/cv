import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const isSub = (w, s) => { let i = 0; for (const c of s) if (i < w.length && c === w[i]) i++; return i === w.length }
test('official examples', () => {
  assert.equal(buildTrace({ s: 'abcde', words: ['a', 'bb', 'acd', 'ace'] }).result, 3)
  assert.equal(buildTrace({ s: 'dsahjpjauf', words: ['ahjpjau', 'ja', 'ahbwzgqnuk', 'tnmlanowax'] }).result, 2)
})
test('matches per-word two-pointer check', () => {
  const rc = n => Array.from({ length: n }, () => 'abc'[Math.floor(Math.random() * 3)]).join('')
  for (let t = 0; t < 400; t++) {
    const s = rc(1 + Math.floor(Math.random() * 15))
    const words = Array.from({ length: 1 + Math.floor(Math.random() * 6) }, () => rc(1 + Math.floor(Math.random() * 4)))
    const run = buildTrace(parseInput(JSON.stringify({ s, words })))
    assert.equal(run.result, words.filter(w => isSub(w, s)).length)
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"s":"abc","words":[]}'))
  assert.throws(() => parseInput('{"s":"abc","words":[""]}'))
  assert.throws(() => parseInput('[]'))
})
