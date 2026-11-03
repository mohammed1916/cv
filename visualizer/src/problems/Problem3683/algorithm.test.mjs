import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3683 invented examples', () => {
  assert.equal(solve('[[4,9],[10,1],[3,20]]'), 11)
  assert.equal(solve('[[50,50]]'), 100)
})

test('3683 earliest finish is the minimum of start plus duration', () => {
  assert.equal(solve('[[1,100],[2,1],[3,1]]'), 3)
  assert.throws(() => parseInput('[[0,5]]'))
})
