import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, encCost, flatCost) => buildTrace(parseInput(JSON.stringify({ s, encCost, flatCost }))).result

test('3864 invented example with a split', () => {
  assert.equal(solve('1010', 2, 1), 6)
})

test('3864 a string with no sensitive element costs one flat charge', () => {
  assert.equal(solve('000', 1, 5), 5)
})

test('3864 halves can beat the whole', () => {
  assert.equal(solve('0110', 3, 2), 10)
})

test('3864 rejects a non-binary string', () => {
  assert.throws(() => parseInput('{"s":"012","encCost":1,"flatCost":1}'))
})
