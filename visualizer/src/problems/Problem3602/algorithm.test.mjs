import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3602 official example', () => {
  assert.equal(solve(13), 'A91P1')
})

test('3602 edge cases and validation', () => {
  assert.equal(solve(1), '11')
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":1001}'))
})

// Independent oracle: the built-in radix conversions.
const oracle = n => (n * n).toString(16).toUpperCase() + (n ** 3).toString(36).toUpperCase()

test('3602 seeded random cases match the built-in radix conversion', () => {
  let seed = 3602
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(1000)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
