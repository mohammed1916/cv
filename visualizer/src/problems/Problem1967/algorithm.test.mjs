import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (patterns, word) => buildTrace(parseInput(JSON.stringify({ patterns, word }))).result

test('1967 invented patterns', () => {
  assert.equal(solve(['ab', 'cd', 'a'], 'xaby'), 2)
  assert.equal(solve(['z'], 'abc'), 0)
  assert.equal(solve(['abc', 'bc'], 'abc'), 2)
})
