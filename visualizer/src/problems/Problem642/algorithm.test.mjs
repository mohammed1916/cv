import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('642 official example', () => {
  const spec = { sentences: ['i love you', 'island', 'ironman', 'i love leetcode'], times: [5, 3, 2, 2], typed: 'i a#' }
  assert.deepEqual(buildTrace(spec).result, [
    ['i love you', 'island', 'i love leetcode'],
    ['i love you', 'i love leetcode'],
    [],
    [],
  ])
})

test('642 saving a sentence raises its rank for later prefixes', () => {
  const spec = { sentences: ['abc', 'abd'], times: [1, 1], typed: 'abd#ab' }
  assert.deepEqual(buildTrace(spec).result, [
    ['abc', 'abd'],
    ['abc', 'abd'],
    ['abd'],
    [],
    ['abd', 'abc'],
    ['abd', 'abc'],
  ])
})

test('642 rejects uppercase sentences', () => {
  assert.throws(() => parseInput('{"sentences":["I"],"times":[1],"typed":"i"}'))
})

// Independent oracle: rescan a plain list of records at every character.
function oracle(spec) {
  const records = spec.sentences.map((s, i) => ({ s, t: spec.times[i] }))
  let typed = ''
  return [...spec.typed].map(char => {
    if (char === '#') {
      const hit = records.find(r => r.s === typed)
      if (hit) hit.t++
      else records.push({ s: typed, t: 1 })
      typed = ''
      return []
    }
    typed += char
    return records
      .filter(r => r.s.startsWith(typed))
      .sort((a, b) => b.t - a.t || (a.s < b.s ? -1 : a.s > b.s ? 1 : 0))
      .slice(0, 3)
      .map(r => r.s)
  })
}

test('642 random typing matches a list-scan oracle', () => {
  let seed = 9
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  const word = () => Array.from({ length: 1 + rnd(4) }, () => 'ab '[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const sentences = [...new Set(Array.from({ length: 1 + rnd(6) }, word))]
    const spec = {
      sentences,
      times: sentences.map(() => 1 + rnd(5)),
      typed: Array.from({ length: 1 + rnd(20) }, () => 'ab #'[rnd(4)]).join(''),
    }
    assert.deepEqual(buildTrace(spec).result, oracle(spec), JSON.stringify(spec))
  }
})
