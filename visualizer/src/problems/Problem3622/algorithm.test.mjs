import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3622 official examples', () => {
  assert.equal(solve(23), false)
  assert.equal(solve(10), true)
})

test('3622 edge cases and validation', () => {
  assert.equal(solve(1), false)
  assert.equal(solve(100000), true)
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":100001}'))
})

// Independent oracle: read the digits from the decimal string.
function oracle(n) {
  const ds = String(n).split('').map(Number)
  const sum = ds.reduce((a, b) => a + b, 0)
  const product = ds.reduce((a, b) => a * b, 1)
  return n % (sum + product) === 0
}

test('3622 seeded random cases match a string-digit oracle', () => {
  let seed = 3622
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(100000)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
