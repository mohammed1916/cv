import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3747 official examples', () => {
  assert.equal(solve(10), 9)
  assert.equal(solve(3), 3)
})

test('3747 numbers with zeros and boundary values', () => {
  assert.equal(solve(100), 90)
  assert.equal(solve(1), 1)
  assert.equal(solve(99), 90)
})

test('3747 rejects n of zero', () => {
  assert.throws(() => parseInput('{"n":0}'))
})

// Independent oracle: strip zeros from every x in 1..n as the statement says, and count distinct results.
function oracle(n) {
  const seen = new Set()
  for (let x = 1; x <= n; x++) {
    const stripped = String(x).replace(/0/g, '')
    if (stripped.length) seen.add(Number(stripped))
  }
  return seen.size
}

let seed = 3747
const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }

test('3747 seeded random against strip-and-collect oracle', () => {
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(3000)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
