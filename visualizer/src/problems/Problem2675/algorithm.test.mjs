import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2675 teaching model examples', () => {
  assert.deepEqual(buildTrace(parseInput('{"rows":[{"id":1,"name":"Ada"},{"id":2,"email":"x"}]}')).result,
    [['email', 'id', 'name'], ['', 1, 'Ada'], ['x', 2, '']])
  assert.deepEqual(buildTrace(parseInput('{"rows":[{"b":{"c":1}},[7]]}')).result,
    [['0', 'b.c'], ['', 1], [7, '']])
  assert.deepEqual(buildTrace(parseInput('{"rows":[]}')).result, [[]])
})
