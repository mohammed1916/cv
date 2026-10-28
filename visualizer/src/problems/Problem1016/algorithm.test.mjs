import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, n) => buildTrace(parseInput(JSON.stringify({ s, n }))).result

test('1016 examples', () => {
  assert.equal(solve('0110', 3), true)
  assert.equal(solve('0110', 4), false)
})

test('1016 a single digit covers only one', () => {
  assert.equal(solve('1', 1), true)
  assert.equal(solve('1', 2), false)
})

test('1016 rejects characters other than 0 and 1', () => {
  assert.throws(() => parseInput('{"s":"012","n":1}'))
  assert.throws(() => parseInput('{"s":"01","n":0}'))
})

// Independent oracle: collect every substring of s into a set, then test each binary form for membership.
function oracle(s, n) {
  const subs = new Set()
  for (let i = 0; i < s.length; i++) for (let j = i + 1; j <= s.length; j++) subs.add(s.slice(i, j))
  for (let x = 1; x <= n; x++) if (!subs.has(x.toString(2))) return false
  return true
}

test('1016 random binary strings match a substring-set oracle', () => {
  let seed = 1016
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(20)
    let s = ''
    for (let i = 0; i < len; i++) s += '01'[rnd(2)]
    const n = 1 + rnd(40)
    assert.equal(solve(s, n), oracle(s, n), `${s} ${n}`)
  }
})
