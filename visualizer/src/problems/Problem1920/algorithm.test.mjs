import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1920 invented permutations', () => {
  assert.deepEqual(solve('[3,0,1,2]'), [2, 3, 0, 1])
  assert.deepEqual(solve('[0]'), [0])
})

test('1920 rejects non-permutations', () => {
  assert.throws(() => parseInput('[0,0,1]'))
  assert.throws(() => parseInput('[1,2,3]'))
})
