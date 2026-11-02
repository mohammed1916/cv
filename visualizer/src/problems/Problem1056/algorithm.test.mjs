import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = n => buildTrace(n).result
const pyLines = python.split('\n').length

test('1056 worked examples', () => {
  assert.equal(solve(6), true)
  assert.equal(solve(89), true)
  assert.equal(solve(11), false)
  assert.equal(solve(1001), false)
})

test('1056 edge cases', () => {
  assert.equal(solve(0), false)
  assert.equal(solve(10), true)
  assert.equal(solve(2), false)
  assert.equal(solve(916), false)
  assert.equal(solve(69), false)
  assert.equal(solve(68), true)
})

test('1056 frames carry valid pseudocode and python lines', () => {
  for (const frame of buildTrace(89).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1056 rejects bad input', () => {
  assert.throws(() => parseInput('-1'))
  assert.throws(() => parseInput('1.5'))
  assert.throws(() => parseInput('1000000000'))
})

// Oracle: string based. Every digit must be in the rotation table, and the reversed rotated string must differ.
function oracle(n) {
  const table = { '0': '0', '1': '1', '6': '9', '8': '8', '9': '6' }
  const s = String(n)
  if ([...s].some(c => !(c in table))) return false
  const rotated = [...s].reverse().map(c => table[c]).join('')
  return Number(rotated) !== n
}

test('1056 numbers up to 20000 and random values match a string oracle', () => {
  for (let n = 0; n <= 20000; n++) assert.equal(solve(n), oracle(n), String(n))
  let seed = 1056
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = rnd(10 ** (1 + rnd(9)))
    assert.equal(solve(n), oracle(n), String(n))
  }
})
