import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace(parseInput(JSON.stringify({ num }))).result

test('2443 official examples', () => {
  assert.equal(solve(443), true)
  assert.equal(solve(63), false)
})

test('2443 edge cases and validation', () => {
  assert.equal(solve(0), true)
  assert.equal(solve(2), true)
  assert.throws(() => parseInput('{"num":-1}'))
  assert.throws(() => parseInput('{"num":1001}'))
})

// Independent oracle: collect every x + reverse(x) for x up to 1000, using the decimal string for reversal.
const sums = new Set()
for (let x = 0; x <= 1000; x++) sums.add(x + Number(String(x).split('').reverse().join('')))

test('2443 every value up to 1000 matches a collected-sums oracle', () => {
  for (let num = 0; num <= 1000; num++) assert.equal(solve(num), sums.has(num), String(num))
})
