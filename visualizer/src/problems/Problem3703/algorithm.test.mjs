import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

// Oracle: remove any k-balanced block repeatedly until none is left.
function oracle(s, k) {
  const pat = '('.repeat(k) + ')'.repeat(k)
  while (s.includes(pat)) s = s.split(pat).join('')
  return s
}

test('3703 invented examples', () => {
  assert.equal(solve('(()())((', 1), oracle('(()())((', 1))
  assert.equal(solve('(((())))', 2), '')
})

test('3703 matches repeated-removal oracle', () => {
  for (const [s, k] of [['(()(', 1], ['((())()', 2], [')(()))(', 1], ['((()))))((', 3], ['()()()', 1]]) {
    assert.equal(solve(s, k), oracle(s, k))
  }
})
