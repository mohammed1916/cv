import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace({ text }).result

test('1328 sample inputs give the expected strings', () => {
  assert.equal(solve('noon'), 'aoon')
  assert.equal(solve('aaaa'), 'aaab')
  assert.equal(solve('level'), 'aevel')
})

test('1328 a single character breaks to the empty string', () => {
  assert.equal(solve('z'), '')
})

test('1328 rejects malformed input', () => {
  assert.throws(() => parseInput('{"text":"abc"}'), /palindrome/)
  assert.throws(() => parseInput('{"text":"AA"}'), /lowercase/)
  assert.throws(() => parseInput('{"text":""}'), /1 to 30/)
  assert.throws(() => parseInput('{"text":3}'), /1 to 30/)
})

// Independent oracle: try every single-character replacement, keep those that are not palindromes, and take the smallest.
test('1328 matches a replace-and-compare oracle on small palindromes', () => {
  const alphabet = 'abcz'
  const palindromes = []
  const build = (half, length) => {
    if (half.length === Math.ceil(length / 2)) {
      const left = half.split('')
      const right = half.slice(0, length % 2 ? -1 : undefined).split('').reverse()
      palindromes.push([...left, ...right].join(''))
      return
    }
    for (const ch of alphabet) build(half + ch, length)
  }
  for (let length = 1; length <= 5; length++) build('', length)
  for (const text of palindromes) {
    const isPal = s => s === [...s].reverse().join('')
    let best = null
    if (text.length > 1) {
      for (let i = 0; i < text.length; i++) for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
        if (ch === text[i]) continue
        const candidate = text.slice(0, i) + ch + text.slice(i + 1)
        if (!isPal(candidate) && (best === null || candidate < best)) best = candidate
      }
    } else {
      best = ''
    }
    assert.equal(solve(text), best, text)
  }
})
