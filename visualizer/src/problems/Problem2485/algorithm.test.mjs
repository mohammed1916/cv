import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('2485 official examples', () => {
  assert.equal(solve(8), 6)
  assert.equal(solve(1), 1)
  assert.equal(solve(4), -1)
})

test('2485 edge cases and validation', () => {
  assert.equal(solve(49), 35)
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":1001}'))
})

// Independent oracle: build both sums as explicit loops for each x and compare.
function oracle(n) {
  for (let x = 1; x <= n; x++) {
    let left = 0
    for (let i = 1; i <= x; i++) left += i
    let right = 0
    for (let i = x; i <= n; i++) right += i
    if (left === right) return x
  }
  return -1
}

test('2485 seeded random cases match a loop-sum oracle', () => {
  let seed = 2485
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(300)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
