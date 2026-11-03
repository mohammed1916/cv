import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

function oracle(s) {
  let count = 0
  for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
    if (s.slice(i, j + 1).split('').every(c => c === '1')) count++
  }
  return count % 1000000007
}

test('1513 sample strings give hand-counted totals', () => {
  assert.equal(solve('0110111'), 9)
  assert.equal(solve('0000'), 0)
  assert.equal(solve('1'), 1)
  assert.equal(solve('111'), 6)
})

test('1513 every binary string up to length 10 matches the oracle', () => {
  for (let len = 1; len <= 10; len++) {
    for (let mask = 0; mask < (1 << len); mask++) {
      const s = mask.toString(2).padStart(len, '0')
      assert.equal(solve(s), oracle(s), s)
    }
  }
})

test('1513 a long block counts n(n+1)/2 substrings', () => {
  const s = '1'.repeat(200)
  assert.equal(solve(s), 200 * 201 / 2)
})

test('1513 rejects malformed input', () => {
  assert.throws(() => parseInput(''), /1 to 200/)
  assert.throws(() => parseInput('01a1'), /0 or 1/)
  assert.throws(() => parseInput('1'.repeat(201)), /1 to 200/)
})
