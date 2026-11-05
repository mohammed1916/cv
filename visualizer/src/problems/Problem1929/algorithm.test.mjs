import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1929 invented arrays are repeated once', () => {
  assert.deepEqual(solve('[2,5,2]'), [2, 5, 2, 2, 5, 2])
  assert.deepEqual(solve('[7]'), [7, 7])
})
