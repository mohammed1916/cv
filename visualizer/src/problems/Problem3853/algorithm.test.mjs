import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('3853 chained merges from invented data', () => {
  assert.equal(solve('mnmpnm', 2), 'mnpm')
})

test('3853 merges run in one long chain', () => {
  assert.equal(solve('aaa', 1), 'a')
})

test('3853 no merge when every equal pair is far apart', () => {
  assert.equal(solve('abab', 1), 'abab')
})

test('3853 rejects a k of zero', () => {
  assert.throws(() => parseInput('{"s":"ab","k":0}'))
})
