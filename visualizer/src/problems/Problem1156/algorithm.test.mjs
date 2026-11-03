import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Brute force: try every swap (including none) and take the longest same-letter run.
function brute(s) {
  const longestRun = t => {
    let best = 0
    for (let i = 0; i < t.length;) {
      let j = i
      while (j < t.length && t[j] === t[i]) j++
      best = Math.max(best, j - i)
      i = j
    }
    return best
  }
  let best = longestRun(s)
  const a = s.split('')
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) {
    const b = [...a];
    [b[i], b[j]] = [b[j], b[i]]
    best = Math.max(best, longestRun(b.join('')))
  }
  return best
}

test('one spare copy after a single differing letter', () => {
  assert.equal(buildTrace('aaabaaa').result, 6)
})

test('all distinct letters cannot form a longer run than one', () => {
  assert.equal(buildTrace('abcdef').result, 1)
})

test('a run of three with a spare fourth-position repair', () => {
  assert.equal(buildTrace('aaabbb').result, 3)
})

test('matches a brute force over swaps on small strings', () => {
  const alphabet = ['a', 'b', 'c']
  for (let len = 1; len <= 7; len++) {
    const total = alphabet.length ** len
    for (let code = 0; code < total; code += 1) {
      let s = ''
      let x = code
      for (let i = 0; i < len; i++) { s += alphabet[x % 3]; x = Math.floor(x / 3) }
      assert.equal(buildTrace(s).result, brute(s), s)
    }
  }
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput(''), /lowercase/)
  assert.throws(() => parseInput('ab cd'), /lowercase/)
  assert.throws(() => parseInput('A'), /lowercase/)
})

test('frames reference valid pseudocode lines', () => {
  const run = buildTrace('aabaa')
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 11)
  assert.equal(run.frames.at(-1).phase, 'done')
})
