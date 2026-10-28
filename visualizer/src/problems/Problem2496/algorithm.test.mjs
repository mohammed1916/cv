import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = strs => buildTrace(parseInput(JSON.stringify({ strs }))).result

test('2496 examples', () => {
  assert.equal(solve(['alic3', 'bob', '3', '4', '00000']), 5)
  assert.equal(solve(['1', '01', '001', '0001']), 1)
})

test('2496 a digit string with leading zeros is still its number', () => {
  assert.equal(solve(['000', 'ab']), 2)
  assert.equal(solve(['000000009']), 9)
})

test('2496 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"strs":["Ab"]}'))
})

// Independent oracle: map each string through a regular expression test, then take the maximum.
function oracle(strs) {
  return Math.max(...strs.map(s => (/^\d+$/.test(s) ? parseInt(s, 10) : s.length)))
}

test('2496 random arrays match a mapping oracle', () => {
  let seed = 2496
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(8)
    const strs = []
    for (let w = 0; w < count; w++) {
      let s = ''
      const len = 1 + rnd(4)
      for (let i = 0; i < len; i++) s += '0123a'[rnd(5)]
      strs.push(s)
    }
    assert.equal(solve(strs), oracle(strs), JSON.stringify(strs))
  }
})
