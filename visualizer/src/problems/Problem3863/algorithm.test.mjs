import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3863 already sorted needs no operation', () => {
  assert.equal(solve('abc'), 0)
})

test('3863 one proper substring sort is enough', () => {
  assert.equal(solve('abdc'), 1)
  assert.equal(solve('dog'), 1)
})

test('3863 reversed letters need a search', () => {
  assert.equal(solve('cba'), 3)
})

test('3863 rejects capital letters', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
})
