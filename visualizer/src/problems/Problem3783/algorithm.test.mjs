import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3783 official examples', () => {
  assert.equal(solve(25), 27)
  assert.equal(solve(10), 9)
  assert.equal(solve(7), 0)
})

test('3783 validation', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":100001}'))
})

// Independent oracle: reverse the decimal string.
function oracle(n) {
  return Math.abs(n - Number(String(n).split('').reverse().join('')))
}

test('3783 seeded random cases match a string-reversal oracle', () => {
  let seed = 3783
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(100000)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
