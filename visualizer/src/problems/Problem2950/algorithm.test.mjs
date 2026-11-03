import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = word => buildTrace({ word }).result
const pyLines = python.trim().split('\n').length

const KEYPAD = ['ab', 'cde', 'fgh', 'ijk', 'lmn', 'opq', 'rst', 'uvw', 'xyz']
const weightOf = ch => KEYPAD.findIndex(group => group.includes(ch)) + 1

test('2950 teaching examples', () => {
  assert.equal(solve('aaaa'), 10)
  assert.equal(solve('a'), 1)
  assert.equal(solve('az'), 3)
  // a=1, b=1, c=2: "b" (1), "c" (2), "bc" (1+2=3, length 2 -> no), "ab" (2, length 2 -> yes), "abc" (4, length 3 -> no).
  assert.equal(solve('abc'), 4)
})

test('2950 parser rejects non-letters and empty words', () => {
  assert.throws(() => parseInput('{"word":""}'))
  assert.throws(() => parseInput('{"word":"ab1"}'))
  assert.throws(() => parseInput('{"word":"AB"}'))
})

// Brute oracle: examine every substring directly.
function oracle(word) {
  let count = 0
  for (let i = 0; i < word.length; i++) {
    let sum = 0
    for (let j = i; j < word.length; j++) {
      sum += weightOf(word[j])
      if (sum % (j - i + 1) === 0) count++
    }
  }
  return count
}

test('2950 random words match the substring oracle', () => {
  let seed = 2950
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const word = Array.from({ length: 1 + rnd(14) }, () => letters[rnd(26)]).join('')
    assert.equal(solve(word), oracle(word), word)
  }
})

test('2950 frames keep valid lines and the total never decreases', () => {
  const run = buildTrace({ word: 'kitchen' })
  let previous = 0
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.total >= previous)
    previous = f.total
  }
  assert.equal(run.frames.at(-1).total, run.result)
})
