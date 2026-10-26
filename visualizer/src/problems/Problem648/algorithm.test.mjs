import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('648 official examples', () => {
  assert.equal(buildTrace({ dictionary: ['cat', 'bat', 'rat'], sentence: 'the cattle was rattled by the battery' }).result, 'the cat was rat by the bat')
  assert.equal(buildTrace({ dictionary: ['a', 'b', 'c'], sentence: 'aadsfasf absbs bbab cadsfafs' }).result, 'a a b c')
})

test('648 random sentences match a direct shortest-prefix oracle', () => {
  let state = 33
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const letters = 'abc'
  const word = len => Array.from({ length: len }, () => letters[rand(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const dictionary = Array.from({ length: 1 + rand(4) }, () => word(1 + rand(3)))
    const sentence = Array.from({ length: 1 + rand(5) }, () => word(1 + rand(5))).join(' ')
    const expected = sentence.split(' ').map(w => {
      const roots = dictionary.filter(r => w.startsWith(r)).sort((a, b) => a.length - b.length)
      return roots.length ? roots[0] : w
    }).join(' ')
    assert.equal(buildTrace({ dictionary, sentence }).result, expected, JSON.stringify({ dictionary, sentence }))
  }
})

test('648 rejects uppercase words', () => {
  assert.throws(() => parseInput('{"dictionary":["a"],"sentence":"Abc"}'))
})
