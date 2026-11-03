import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, t) => buildTrace(parseInput(JSON.stringify({ s, t }))).result

test('3849 invented example', () => {
  assert.equal(solve('0011', '1101'), '1110')
})

test('3849 equal strings', () => {
  assert.equal(solve('1', '1'), '0')
  assert.equal(solve('0', '0'), '0')
})

test('3849 rejects unequal lengths', () => {
  assert.throws(() => parseInput('{"s":"01","t":"011"}'))
})
