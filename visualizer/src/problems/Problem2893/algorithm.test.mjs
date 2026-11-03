import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const counts = minutes => buildTrace(minutes).result

test('2893 mixed minutes land in their hour buckets', () => {
  // 5 -> 0, 62 -> 1, 64 -> 1, 130 -> 2
  assert.deepEqual(counts([5, 62, 64, 130]), [1, 2, 1, 0, 0, 0, 0, 0, 0, 0])
})

test('2893 edge minutes and an empty list', () => {
  // 0 -> 0, 599 -> 9, 540 -> 9
  assert.deepEqual(counts([0, 599, 540]), [1, 0, 0, 0, 0, 0, 0, 0, 0, 2])
  assert.deepEqual(counts([]), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
})

test('2893 rejects minutes outside 0 to 599', () => {
  assert.throws(() => parseInput('[600]'))
  assert.throws(() => parseInput('[-1]'))
})
