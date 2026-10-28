import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3211 official examples', () => {
  assert.deepEqual(solve(3), ['010', '011', '101', '110', '111'])
  assert.deepEqual(solve(1), ['0', '1'])
})

test('3211 the count follows the Fibonacci numbers', () => {
  assert.equal(solve(6).length, 21)
})

test('3211 rejects a length of zero', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('9'))
})

// Independent oracle: keep every bit string of length n that has no "00", then sort them.
function oracle(n) {
  const out = []
  for (let mask = 0; mask < 1 << n; mask++) {
    const s = mask.toString(2).padStart(n, '0')
    if (!s.includes('00')) out.push(s)
  }
  return out.sort()
}

test('3211 every length from 1 to 8 matches a bit-mask oracle', () => {
  for (let n = 1; n <= 8; n++) assert.deepEqual(solve(n), oracle(n), `n=${n}`)
})
