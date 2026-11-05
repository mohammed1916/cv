import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (words, pref) => buildTrace(parseInput(JSON.stringify({ words, pref }))).result

test('2185 worked examples', () => {
  assert.equal(solve(['pay', 'attention', 'practice', 'attend'], 'at'), 2)
  assert.equal(solve(['leetcode', 'win', 'loops', 'success'], 'code'), 0)
  assert.equal(solve(['a'], 'a'), 1)
  assert.equal(solve(['abc', 'ab'], 'abc'), 1)
})

test('2185 rejects invalid input', () => {
  assert.throws(() => parseInput('{"words":["A"],"pref":"a"}'))
  assert.throws(() => parseInput('{"words":[],"pref":"a"}'))
  assert.throws(() => parseInput('{"words":["ab"],"pref":""}'))
})

test('2185 matches startsWith for random words', () => {
  let seed = 2185
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = () => Array.from({ length: 1 + rnd(4) }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 200; t++) {
    const words = Array.from({ length: 1 + rnd(6) }, word)
    const pref = word().slice(0, 1 + rnd(3))
    assert.equal(solve(words, pref), words.filter(w => w.startsWith(pref)).length)
  }
})

test('2185 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"words":["ab"],"pref":"a"}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
