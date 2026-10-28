import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2325 official examples', () => {
  assert.equal(solve('{"key":"the quick brown fox jumps over the lazy dog","message":"vkbs bs t suepuv"}'), 'this is a secret')
  assert.equal(solve('{"key":"eljuxhpwnyrdgtqkviszcfmabo","message":"zwx hnfx lqantp mnoeius ycgk vcnjrdb"}'), 'the five boxing wizards jump quickly')
})

test('2325 spaces in the key are skipped, not mapped', () => {
  assert.equal(solve('{"key":"b a c d e f g h i j k l m n o p q r s t u v w x y z","message":"b"}'), 'a')
})

test('2325 rejects a key missing a letter', () => {
  assert.throws(() => parseInput('{"key":"abcdefghijklmnopqrstuvwxy","message":"a"}'))
})

// Independent oracle: list the distinct key letters in first-seen order; position i gives plain letter i.
function oracle(key, message) {
  const distinct = [...new Set(key.replace(/ /g, ''))]
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  return [...message].map(ch => (ch === ' ' ? ' ' : alphabet[distinct.indexOf(ch)])).join('')
}

test('2325 random keys and messages match an index-lookup oracle', () => {
  let seed = 2325
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 250; round++) {
    const alpha = 'abcdefghijklmnopqrstuvwxyz'.split('')
    for (let i = 25; i > 0; i--) { const j = rnd(i + 1); [alpha[i], alpha[j]] = [alpha[j], alpha[i]] }
    const letters = alpha.map(ch => (rnd(4) === 0 ? ch + ' ' : ch)).join('').split('')
    for (let extra = rnd(4); extra > 0; extra--) letters.splice(rnd(letters.length + 1), 0, 'abcdefghijklmnopqrstuvwxyz'[rnd(26)])
    const key = letters.join('').replace(/^ +| +$/g, '')
    let message = ''
    for (let i = 0, len = 1 + rnd(12); i < len; i++) message += rnd(5) === 0 ? ' ' : alpha[rnd(26)]
    message = message.replace(/^ +| +$/g, '') || 'a'
    const text = JSON.stringify({ key, message })
    assert.equal(solve(text), oracle(key, message), text)
  }
})
