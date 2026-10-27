import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('1541 official examples', () => {
  assert.equal(solve('(()))'), 1)
  assert.equal(solve('())'), 0)
  assert.equal(solve('(((('), 8)
})

test('1541 a lone close bracket needs two insertions', () => {
  assert.equal(solve(')'), 2)
})

test('1541 rejects other characters', () => {
  assert.throws(() => parseInput('{"s":"(a)"}'))
})

// Independent oracle: try every insertion of k brackets, and accept the first k for which some result is balanced.
// A string is balanced when every open bracket is followed by a pair of close brackets, matched like nested brackets.
function balanced(t) {
  let open = 0
  let i = 0
  while (i < t.length) {
    if (t[i] === '(') { open++; i++ } else {
      if (t[i + 1] !== ')' || open === 0) return false
      open--
      i += 2
    }
  }
  return open === 0
}

function containsSubsequence(s, t) {
  let j = 0
  for (let i = 0; i < t.length && j < s.length; i++) if (t[i] === s[j]) j++
  return j === s.length
}

function oracle(s) {
  for (let k = 0; ; k++) {
    for (let mask = 0; mask < 2 ** (s.length + k); mask++) {
      let t = ''
      for (let b = 0; b < s.length + k; b++) t += mask & (1 << b) ? ')' : '('
      if (containsSubsequence(s, t) && balanced(t)) return k
    }
  }
}

test('1541 random strings match an exhaustive insertion oracle', () => {
  let seed = 1541
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const s = Array.from({ length: 1 + rnd(5) }, () => '()'[rnd(2)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
