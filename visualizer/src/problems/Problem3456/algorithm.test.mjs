import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('3456 examples', () => {
  assert.equal(solve('aaabaaa', 3), true)
  assert.equal(solve('abc', 2), false)
  assert.equal(solve('aaaa', 2), false)
})

test('3456 a block that is too long does not count', () => {
  assert.equal(solve('aaaab', 2), false)
  assert.equal(solve('aaaab', 4), true)
})

test('3456 rejects k out of range', () => {
  assert.throws(() => parseInput('{"s":"ab","k":3}'))
  assert.throws(() => parseInput('{"s":"ab","k":0}'))
})

// Independent oracle: split the string into maximal runs with a regular expression and look for a run of length k.
function oracle(s, k) {
  for (const [run] of s.matchAll(/(.)\1*/g)) if (run.length === k) return true
  return false
}

test('3456 random strings match a maximal-run oracle', () => {
  let seed = 3456
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(20)
    let s = ''
    for (let i = 0; i < len; i++) s += 'aab'[rnd(3)]
    const k = 1 + rnd(len)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
