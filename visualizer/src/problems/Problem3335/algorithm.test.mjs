import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const MOD = 1000000007
const solve = (s, t) => buildTrace(parseInput(JSON.stringify({ s, t }))).result

test('3335 official examples', () => {
  assert.equal(solve('abcyy', 2), 7)
  assert.equal(solve('azbk', 1), 5)
})

test('3335 z becomes ab and the letters keep moving', () => {
  assert.equal(solve('z', 1), 2)
  assert.equal(solve('z', 2), 2)
  assert.equal(solve('abc', 0), 3)
})

test('3335 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"ABC","t":1}'))
  assert.throws(() => parseInput('{"s":"a","t":21}'))
  assert.throws(() => parseInput('{"s":"","t":1}'))
})

test('3335 every frame points at a real pseudocode line', () => {
  for (const frame of buildTrace(parseInput('{"s":"abcyy","t":2}')).frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
})

// Independent oracle: build the transformed string itself, one round at a time.
function oracle(s, t) {
  let text = s
  for (let round = 0; round < t; round++) {
    text = [...text].map(ch => (ch === 'z' ? 'ab' : String.fromCharCode(ch.charCodeAt(0) + 1))).join('')
  }
  return text.length % MOD
}

test('3335 random strings match the string-building oracle', () => {
  let seed = 3335
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let k = 0; k < 200; k++) {
    const length = 1 + rnd(8)
    let s = ''
    for (let i = 0; i < length; i++) s += String.fromCharCode(97 + rnd(26))
    const t = rnd(13)
    assert.equal(solve(s, t), oracle(s, t), `${s} ${t}`)
  }
})
