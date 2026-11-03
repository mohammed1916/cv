import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace({ words }).result

test('3435 two swapped words give two profiles', () => {
  const result = solve(['xy', 'yx'])
  assert.equal(result.length, 2)
  assert.equal(result[0][23], 1)
  assert.equal(result[0][24], 2)
  assert.equal(result[1][23], 2)
  assert.equal(result[1][24], 1)
})

test('3435 a shared first letter keeps one profile', () => {
  const result = solve(['mm', 'mn'])
  assert.equal(result.length, 1)
  assert.equal(result[0][12], 2)
  assert.equal(result[0][13], 1)
})

test('3435 a single word gives its own letter counts', () => {
  const result = solve(['ab'])
  assert.equal(result.length, 1)
  assert.equal(result[0][0], 1)
  assert.equal(result[0][1], 1)
})

test('3435 rejects words that are not two letters', () => {
  assert.throws(() => parseInput('{"words":["abc"]}'))
  assert.throws(() => parseInput('{"words":["ab","ab"]}'))
})
