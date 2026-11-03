import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = caption => buildTrace({ caption }).result

test('3441 a caption that is already good costs nothing', () => {
  assert.equal(solve('aaabbb'), 'aaabbb')
  assert.equal(solve('bbbb'), 'bbbb')
})

test('3441 picks the cheapest letter and breaks ties alphabetically', () => {
  assert.equal(solve('abc'), 'bbb')
  assert.equal(solve('aab'), 'aaa')
})

test('3441 a caption shorter than three letters has no answer', () => {
  assert.equal(solve('zz'), '')
  assert.equal(solve('q'), '')
})

test('3441 rejects an empty caption', () => {
  assert.throws(() => parseInput('{"caption":""}'))
})
