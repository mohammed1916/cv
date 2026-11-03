import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2623 repeated argument lists reuse the stored value', () => {
  assert.deepEqual(solve('{"calls":[[1,2],[1,2],[3]]}'), { values: [3, 3, 3], underlyingCalls: 2 })
})

test('2623 the empty argument list is its own key', () => {
  assert.deepEqual(solve('{"calls":[[],[],[5]]}'), { values: [0, 0, 5], underlyingCalls: 2 })
})

test('2623 rejects more than three arguments', () => {
  assert.throws(() => parseInput('{"calls":[[1,2,3,4]]}'))
})
