import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('961 finds the value that fills half the array', () => {
  assert.equal(buildTrace(parseInput('{"nums":[7,3,7,9]}')).result, 7)
  assert.equal(buildTrace(parseInput('{"nums":[4,8,6,4,4,1]}')).result, 4)
  assert.equal(buildTrace(parseInput('{"nums":[5,5,5,5,1,2,3,4]}')).result, 5)
  assert.equal(buildTrace(parseInput('{"nums":[0,9,2,9,9,3,9,8]}')).result, 9)
})

test('961 rejects arrays that break the statement guarantee', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3]}'))
  assert.throws(() => parseInput('{"nums":[1,2,3,4]}'))
  assert.throws(() => parseInput('{"nums":[1,1,2,2]}'))
})
