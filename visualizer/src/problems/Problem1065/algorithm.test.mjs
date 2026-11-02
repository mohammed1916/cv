import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (text, words) => buildTrace({ text, words }).result
const pyLines = python.split('\n').length

test('1065 worked example', () => {
  assert.deepEqual(solve('thestoryofleetcodeandme', ['story', 'fleet', 'leetcode']), [[3, 7], [9, 13], [10, 17]])
})

test('1065 overlaps count and duplicates are recorded once', () => {
  assert.deepEqual(solve('aaaa', ['aa']), [[0, 1], [1, 2], [2, 3]])
  assert.deepEqual(solve('abab', ['ab', 'bab']), [[0, 1], [1, 3], [2, 3]])
  assert.deepEqual(solve('abc', ['x', 'y']), [])
  assert.deepEqual(solve('aa', ['a', 'a']), [[0, 0], [1, 1]])
})

test('1065 frames carry valid pseudocode and python lines', () => {
  for (const frame of buildTrace({ text: 'abab', words: ['ab'] }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1065 rejects empty words and overlong text', () => {
  assert.throws(() => parseInput('{"text":"abc","words":[""]}'))
  assert.throws(() => parseInput(`{"text":"${'a'.repeat(31)}","words":["a"]}`))
})

// Oracle: test every inclusive [start, end] window against every word, then sort.
function oracle(text, words) {
  const found = new Set()
  for (let a = 0; a < text.length; a++) for (let b = a; b < text.length; b++) {
    if (words.includes(text.slice(a, b + 1))) found.add(`${a},${b}`)
  }
  return [...found].map(key => key.split(',').map(Number)).sort((x, y) => x[0] - y[0] || x[1] - y[1])
}

test('1065 random inputs match a window oracle', () => {
  let seed = 1065
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const text = word(1 + rnd(12))
    const words = Array.from({ length: 1 + rnd(4) }, () => word(1 + rnd(3)))
    assert.deepEqual(solve(text, words), oracle(text, words), JSON.stringify({ text, words }))
  }
})
