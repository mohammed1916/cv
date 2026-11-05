import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1941 invented strings', () => {
  assert.equal(solve('xxyyzz'), true)
  assert.equal(solve('xxxyz'), false)
  assert.equal(solve('a'), true)
})
