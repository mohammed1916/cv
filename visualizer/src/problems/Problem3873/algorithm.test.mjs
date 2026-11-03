import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = points => buildTrace(parseInput(JSON.stringify({ points }))).result

test('3873 invented example with two groups', () => {
  assert.equal(solve([[0, 0], [0, 5], [7, 5], [9, 9]]), 5)
})

test('3873 a single point', () => {
  assert.equal(solve([[3, 3]]), 2)
})

test('3873 two separate points', () => {
  assert.equal(solve([[0, 0], [1, 1]]), 3)
})

test('3873 rejects duplicate points', () => {
  assert.throws(() => parseInput('{"points":[[1,1],[1,1]]}'))
})
