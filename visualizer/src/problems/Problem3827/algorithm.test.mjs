import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('3827 official examples', () => {
  assert.equal(solve(1), 2)
  assert.equal(solve(4), 3)
})

test('3827 edge cases: zero alone, and the boundary 7', () => {
  assert.equal(solve(0), 1)
  assert.equal(solve(6), 3)
  assert.equal(solve(7), 4)
})

test('3827 rejects a negative n', () => {
  assert.throws(() => parseInput('{"n":-1}'))
})

// Independent oracle: test every integer from 0 to n by comparing its binary digits as a string.
function oracle(n) {
  let count = 0
  for (let x = 0; x <= n; x++) {
    const bits = x.toString(2)
    if (/^(0+|1+)$/.test(bits)) count++
  }
  return count
}

test('3827 every n up to 1000 matches the brute-force oracle', () => {
  for (let n = 0; n <= 1000; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})
