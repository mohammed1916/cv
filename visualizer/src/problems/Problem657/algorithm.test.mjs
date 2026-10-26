import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('657 official examples', () => {
  assert.equal(buildTrace('UD').result, true)
  assert.equal(buildTrace('LL').result, false)
  assert.equal(buildTrace('UDLR').result, true)
})

test('657 every move string up to length 6 matches a count-based oracle', () => {
  function visit(s) {
    const count = c => [...s].filter(x => x === c).length
    if (s.length) assert.equal(buildTrace(s).result, count('U') === count('D') && count('L') === count('R'), s)
    if (s.length < 6) for (const c of 'UDLR') visit(s + c)
  }
  visit('')
})

test('657 rejects other characters', () => {
  assert.throws(() => parseInput('"UX"'))
})
