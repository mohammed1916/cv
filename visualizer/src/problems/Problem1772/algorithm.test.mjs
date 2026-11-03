import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (features, responses) => buildTrace({ features, responses }).result

test('1772 ranks by distinct responses and keeps ties in original order', () => {
  assert.deepEqual(solve(['cooler', 'lock', 'touch'], ['i like cooler cooler', 'lock touch cool', 'locker like tap']), ['cooler', 'lock', 'touch'])
  assert.deepEqual(solve(['a', 'bb', 'c'], ['bb a', 'c', 'bb']), ['bb', 'a', 'c'])
})

test('1772 counts a repeated word only once per response', () => {
  assert.deepEqual(solve(['x', 'y'], ['x x x', 'y']), ['x', 'y'])
  assert.deepEqual(solve(['x', 'y'], ['y', 'y', 'x']), ['y', 'x'])
})

test('1772 rejects a feature that is not a lowercase word', () => {
  assert.throws(() => parseInput('{"features":["Ab"],"responses":["ab"]}'))
  assert.throws(() => parseInput('{"features":["a","a"],"responses":["a"]}'))
})

test('1772 frames reference real pseudocode and python lines', () => {
  const run = buildTrace({ features: ['a', 'b'], responses: ['a b', 'b'] })
  const pyCount = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyCount)
  }
})

// Oracle: a feature counts once per response when it equals one of the space-separated tokens.
function oracle(features, responses) {
  const score = f => responses.filter(r => r.split(' ').includes(f)).length
  return features.map((f, i) => ({ f, i, s: score(f) })).sort((a, b) => b.s - a.s || a.i - b.i).map(x => x.f)
}

test('1772 random inputs match a token-set oracle', () => {
  let seed = 1772
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = () => 'abcd'.slice(0, 1 + rnd(4)).split('').map(() => 'xy'[rnd(2)]).join('')
  for (let t = 0; t < 300; t++) {
    const features = [...new Set(Array.from({ length: 1 + rnd(5) }, word))]
    const responses = Array.from({ length: 1 + rnd(4) }, () => Array.from({ length: 1 + rnd(5) }, word).join(' '))
    assert.deepEqual(solve(features, responses), oracle(features, responses), JSON.stringify({ features, responses }))
  }
})
