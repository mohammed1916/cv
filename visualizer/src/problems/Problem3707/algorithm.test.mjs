import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

// Oracle: check every cut with explicit sums.
function oracle(s) {
  const score = t => [...t].reduce((a, c) => a + c.charCodeAt(0) - 96, 0)
  for (let i = 0; i < s.length - 1; i++) if (score(s.slice(0, i + 1)) === score(s.slice(i + 1))) return true
  return false
}

test('3707 invented examples', () => {
  assert.equal(solve('xaax'), true)
  assert.equal(solve('mnop'), oracle('mnop'))
})

test('3707 matches the oracle', () => {
  for (const s of ['adcb', 'bace', 'aaca', 'abcc', 'zzaa', 'ab', 'yzz']) assert.equal(solve(s), oracle(s))
})
