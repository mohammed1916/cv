import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3412 official examples', () => {
  assert.equal(solve({ s: 'aczzx' }), 5)
  assert.equal(solve({ s: 'abcdef' }), 0)
})

test('3412 a letter pairs with its mirror', () => {
  // y is the mirror of b, so the pair scores 1 - 0.
  assert.equal(solve({ s: 'by' }), 1)
})

test('3412 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"aB"}'))
})

// Independent oracle: for each position, scan backwards for the nearest unmarked mirror letter.
function oracle({ s }) {
  const marked = Array(s.length).fill(false)
  let score = 0
  for (let i = 0; i < s.length; i++) {
    const mirror = String.fromCharCode(219 - s.charCodeAt(i))
    for (let j = i - 1; j >= 0; j--) {
      if (!marked[j] && s[j] === mirror) {
        marked[i] = true
        marked[j] = true
        score += i - j
        break
      }
    }
  }
  return score
}

test('3412 random strings match a backwards-scan oracle', () => {
  let seed = 3412
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { s: Array.from({ length: 1 + rnd(12) }, () => 'abcyzmx'[rnd(7)]).join('') }
    assert.equal(solve(input), oracle(input), input.s)
  }
})
