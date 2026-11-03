import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3847 invented short game', () => {
  assert.equal(solve([2, 3]), -1)
})

test('3847 the sixth game swap is applied after an odd swap', () => {
  assert.equal(solve([7, 2, 2, 2, 2, 2]), -13)
})

test('3847 rejects an empty list', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
})
