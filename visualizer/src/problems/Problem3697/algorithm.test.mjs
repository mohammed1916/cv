import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result

test('3697 invented examples', () => {
  assert.deepEqual(solve(4087), [4000, 80, 7])
  assert.deepEqual(solve(90), [90])
})

test('3697 components sum back to n and each is a single digit times a power of ten', () => {
  for (const n of [1, 10, 102, 999, 1000000, 705060]) {
    const parts = solve(n)
    assert.equal(parts.reduce((a, b) => a + b, 0), n)
    for (const p of parts) assert.match(String(p), /^[1-9]0*$/)
    assert.ok(parts.every((p, i) => i === 0 || parts[i - 1] > p))
  }
})
