import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('3885 polls respect priority, tie breaking, and updates', () => {
  const input = parseInput('{"events":[[3,2],[8,5],[6,5]],"ops":[["poll"],["update",3,9],["poll"],["poll"],["poll"]]}')
  assert.deepEqual(buildTrace(input).result, [6, 3, 8, -1])
})

test('3885 rejects malformed operations', () => {
  assert.throws(() => parseInput('{"events":[[1,1]],"ops":[["bump"]]}'))
  assert.throws(() => parseInput('{"events":[[1,1],[1,2]],"ops":[]}'))
})

test('3885 a later update can move an event past another', () => {
  const input = parseInput('{"events":[[1,3],[2,5]],"ops":[["update",1,9],["poll"],["poll"]]}')
  assert.deepEqual(buildTrace(input).result, [1, 2])
})
