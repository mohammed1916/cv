import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, m) => buildTrace(parseInput(JSON.stringify({ n, m }))).result

test('3021 official examples', () => {
  assert.equal(solve(3, 2), 3)
  assert.equal(solve(1, 1), 0)
})

test('3021 edge cases and validation', () => {
  assert.equal(solve(1, 2), 1)
  assert.throws(() => parseInput('{"n":0,"m":2}'))
  assert.throws(() => parseInput('{"n":2,"m":100001}'))
})

// Independent oracle: test every pair of fields and count the ones with an odd total.
function oracle(n, m) {
  let count = 0
  for (let x = 1; x <= n; x++) {
    for (let y = 1; y <= m; y++) {
      if ((x + y) % 2 === 1) count++
    }
  }
  return count
}

test('3021 seeded random cases match a pair-enumeration oracle', () => {
  let seed = 3021
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(60)
    const m = 1 + rnd(60)
    assert.equal(solve(n, m), oracle(n, m), `${n} ${m}`)
  }
})
