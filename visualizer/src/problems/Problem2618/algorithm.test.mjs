import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2618 finds an ancestor in the chain', () => {
  assert.equal(solve('{"chain":["Dog","Animal","Object"],"target":"Animal"}'), true)
  assert.equal(solve('{"chain":["Dog","Animal"],"target":"Cat"}'), false)
})

test('2618 a primitive is never an instance', () => {
  assert.equal(solve('{"chain":["Object"],"target":"Object","primitive":true}'), false)
})

test('2618 rejects a malformed chain', () => {
  assert.throws(() => parseInput('{"chain":[1],"target":"A"}'))
})
