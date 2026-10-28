import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3561 official examples', () => {
  assert.equal(solve('abc'), 'c')
  assert.equal(solve('adcb'), '')
  assert.equal(solve('zadb'), 'db')
})

test('3561 a and z are consecutive in both orders', () => {
  assert.equal(solve('za'), '')
  assert.equal(solve('az'), '')
})

test('3561 rejects an uppercase letter', () => {
  assert.throws(() => parseInput('{"s":"aB"}'))
})

// Independent oracle: repeatedly remove the leftmost consecutive pair, exactly as the statement describes.
function oracle(s) {
  let t = s
  let removed = true
  while (removed) {
    removed = false
    for (let i = 0; i + 1 < t.length; i++) {
      const d = Math.abs(t.charCodeAt(i) - t.charCodeAt(i + 1))
      if (d === 1 || d === 25) {
        t = t.slice(0, i) + t.slice(i + 2)
        removed = true
        break
      }
    }
  }
  return t
}

test('3561 random strings match the leftmost-removal oracle', () => {
  let seed = 3561
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 300; trial++) {
    const len = 1 + rnd(14)
    const s = Array.from({ length: len }, () => 'abcxyz'[rnd(6)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
