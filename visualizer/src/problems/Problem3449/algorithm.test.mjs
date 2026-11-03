import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (points, m) => buildTrace({ points, m }).result

test('3449 a single cell takes the first move only when no move is left', () => {
  assert.equal(solve([3], 4), 3)
  assert.equal(solve([1, 5], 1), 0)
})

test('3449 walks through a pair of cells', () => {
  assert.equal(solve([1, 5], 3), 2)
})

test('3449 three equal cells can be raised evenly', () => {
  assert.equal(solve([2, 2, 2], 3), 2)
})

test('3449 rejects moves outside the limits', () => {
  assert.throws(() => parseInput('{"points":[1,2],"m":0}'))
  assert.throws(() => parseInput('{"points":[10],"m":2}'))
})
