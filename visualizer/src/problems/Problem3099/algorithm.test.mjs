import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = x => buildTrace(parseInput(JSON.stringify({ x }))).result

test('3099 official examples', () => {
  assert.equal(solve(18), 9)
  assert.equal(solve(23), -1)
})

test('3099 edge cases and validation', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(100), 1)
  assert.throws(() => parseInput('{"x":0}'))
  assert.throws(() => parseInput('{"x":101}'))
})

// Independent oracle: digit sum taken from the decimal string.
function oracle(x) {
  const sum = String(x).split('').reduce((acc, ch) => acc + Number(ch), 0)
  return x % sum === 0 ? sum : -1
}

test('3099 every value up to the cap matches a string-digit oracle', () => {
  for (let x = 1; x <= 100; x++) assert.equal(solve(x), oracle(x), String(x))
})
