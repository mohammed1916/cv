import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).answers

test('3841 worked example from invented data', () => {
  assert.deepEqual(solve('{"n":4,"edges":[[0,1],[1,2],[1,3]],"s":"aabb","queries":["query 2 3","update 1 c","query 0 3"]}'), [true, false])
})

test('3841 a single node path is always a palindrome', () => {
  assert.deepEqual(solve('{"n":2,"edges":[[0,1]],"s":"ab","queries":["query 0 0"]}'), [true])
})

test('3841 rejects malformed edges', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1]],"s":"abc","queries":["query 0 1"]}'))
})
