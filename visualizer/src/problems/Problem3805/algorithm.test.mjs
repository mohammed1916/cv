import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

function similar(s, t) {
  for (let shift = 0; shift < 26; shift++) {
    const moved = [...s].map(c => String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26) + 97)).join('')
    if (moved === t) return true
  }
  return false
}

test('3805 worked cases', () => {
  assert.equal(solve(['abc', 'bcd', 'xyz', 'ab']), 3)
  assert.equal(solve(['aa', 'bb', 'cd']), 1)
  assert.equal(solve(['a', 'b', 'c']), 3)
})

test('3805 matches a brute force over every pair', () => {
  const words = ['abz', 'bca', 'zab', 'xyz', 'qrs', 'rst']
  let expected = 0
  for (let i = 0; i < words.length; i++) for (let j = i + 1; j < words.length; j++) if (similar(words[i], words[j])) expected++
  assert.equal(solve(words), expected)
})

test('3805 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ words: ['ab', 'cd'] }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3805 rejects words of different lengths', () => {
  assert.throws(() => parseInput('{"words":["ab","abc"]}'))
})
