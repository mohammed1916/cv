import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = spec => buildTrace(parseInput(JSON.stringify(spec))).result

test('2213 worked examples', () => {
  assert.deepEqual(solve({ s: 'babacc', queryCharacters: 'bcb', queryIndices: [1, 3, 3] }), [3, 3, 4])
  assert.deepEqual(solve({ s: 'abyzz', queryCharacters: 'aa', queryIndices: [2, 1] }), [2, 3])
  assert.deepEqual(solve({ s: 'x', queryCharacters: 'x', queryIndices: [0] }), [1])
})

test('2213 rejects invalid input', () => {
  assert.throws(() => parseInput('{"s":"ab","queryCharacters":"a","queryIndices":[2]}'))
  assert.throws(() => parseInput('{"s":"ab","queryCharacters":"ab","queryIndices":[0]}'))
  assert.throws(() => parseInput('{"s":"AB","queryCharacters":"a","queryIndices":[0]}'))
})

// Oracle: examine every substring of the updated string and keep the longest one made of a single character.
function oracle(s, qc, qi) {
  const chars = s.split('')
  const out = []
  for (let q = 0; q < qi.length; q++) {
    chars[qi[q]] = qc[q]
    let best = 0
    for (let i = 0; i < chars.length; i++) for (let j = i; j < chars.length; j++) {
      if (chars.slice(i, j + 1).every(c => c === chars[i])) best = Math.max(best, j - i + 1)
    }
    out.push(best)
  }
  return out
}

test('2213 random queries match a substring oracle', () => {
  let seed = 2213
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const s = Array.from({ length: 1 + rnd(8) }, () => 'abc'[rnd(3)]).join('')
    const count = 1 + rnd(4)
    const qc = Array.from({ length: count }, () => 'abc'[rnd(3)]).join('')
    const qi = Array.from({ length: count }, () => rnd(s.length))
    assert.deepEqual(solve({ s, queryCharacters: qc, queryIndices: qi }), oracle(s, qc, qi), JSON.stringify({ s, qc, qi }))
  }
})

test('2213 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"s":"babacc","queryCharacters":"bcb","queryIndices":[1,3,3]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
