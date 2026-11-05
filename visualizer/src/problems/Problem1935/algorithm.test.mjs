import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (text, broken) => buildTrace(parseInput(JSON.stringify({ text, broken }))).result

test('1935 invented sentences', () => {
  assert.equal(solve('tree sun gold', 'xq'), 3)
  assert.equal(solve('red blue', 'e'), 0)
  assert.equal(solve('ok', ''), 1)
})

test('1935 rejects malformed text', () => {
  assert.throws(() => parseInput('{"text":" a","broken":""}'))
})
