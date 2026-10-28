import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(s).result

test('3081 official examples', () => {
  assert.equal(solve('???'), 'abc')
  assert.equal(solve('a?a?'), 'abac')
})

test('3081 fixed letters are kept as they are', () => {
  assert.equal(solve('ab?'), 'abc')
})

test('3081 more than three question marks is rejected by the visualization', () => {
  assert.throws(() => parseInput('"????"'))
})

// Independent oracle: try every filling of the question marks with all 26 letters. The value is
// counted literally as the number of earlier equal characters at each position.
function valueOf(s) {
  let total = 0
  for (let i = 0; i < s.length; i++) for (let j = 0; j < i; j++) if (s[j] === s[i]) total++
  return total
}

function oracle(s) {
  const marks = [...s].map((ch, i) => (ch === '?' ? i : -1)).filter(i => i >= 0)
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  let best = null
  let bestValue = Infinity
  const chars = [...s]
  const go = k => {
    if (k === marks.length) {
      const candidate = chars.join('')
      const v = valueOf(candidate)
      if (v < bestValue || (v === bestValue && candidate < best)) {
        bestValue = v
        best = candidate
      }
      return
    }
    for (const ch of letters) {
      chars[marks[k]] = ch
      go(k + 1)
    }
    chars[marks[k]] = '?'
  }
  go(0)
  return best
}

test('3081 random strings match the filling oracle', () => {
  let seed = 3081
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let marks = 0
  for (let t = 0; t < 150; t++) {
    let s = ''
    const len = 1 + rnd(8)
    for (let i = 0; i < len; i++) {
      if (rnd(4) === 0 && marks < 3) {
        s += '?'
        marks++
      } else {
        s += String.fromCharCode(97 + rnd(4))
      }
    }
    marks = 0
    assert.equal(solve(s), oracle(s), s)
  }
})
