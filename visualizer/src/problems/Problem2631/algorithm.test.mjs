import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2631 items are bucketed by the key value in order', () => {
  assert.deepEqual(solve('{"items":[{"id":1,"g":"a"},{"id":2,"g":"b"},{"id":3,"g":"a"}],"key":"g"}'), { a: [1, 3], b: [2] })
})

test('2631 no items gives an empty object', () => {
  assert.deepEqual(solve('{"items":[],"key":"g"}'), {})
})

test('2631 rejects an item without a string key', () => {
  assert.throws(() => parseInput('{"items":[{"id":1}],"key":"g"}'))
})
