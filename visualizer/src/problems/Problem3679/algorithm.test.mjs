import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3679 worked examples', () => {
  assert.equal(solve('{"arrivals":[1,2,1,3,1],"w":4,"m":2}'), 0)
  assert.equal(solve('{"arrivals":[1,2,3,3,3,4],"w":3,"m":2}'), 1)
})

test('3679 a single type with m = 1 keeps one arrival per window', () => {
  assert.equal(solve('{"arrivals":[5,5,5,5],"w":2,"m":1}'), 2)
  assert.equal(solve('{"arrivals":[5,5,5,5],"w":1,"m":1}'), 0)
})

test('3679 rejects m above w', () => {
  assert.throws(() => parseInput('{"arrivals":[1],"w":1,"m":2}'))
})
