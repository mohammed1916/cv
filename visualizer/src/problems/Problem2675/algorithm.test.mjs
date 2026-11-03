import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2675 teaching model examples', () => {
  assert.deepEqual(buildTrace(parseInput('{"rows":[{"id":1,"name":"Ada"},{"id":2,"email":"x"}]}')).result,
    [['id', 'name', 'email'], [1, 'Ada', ''], [2, '', 'x']])
  assert.deepEqual(buildTrace(parseInput('{"rows":[]}')).result, [[]])
})
