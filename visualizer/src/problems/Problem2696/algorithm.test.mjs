import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('2696 official examples', () => {
  assert.equal(solve('ABFCACDB'), 2)
  assert.equal(solve('ACBBD'), 5)
})

test('2696 removals can chain', () => {
  assert.equal(solve('CABD'), 0)
})

test('2696 rejects lowercase letters', () => {
  assert.throws(() => parseInput('{"s":"ab"}'))
})

// Independent oracle: repeatedly delete the first occurrence of AB or CD until neither is left.
function oracle(s) {
  let t = s
  while (/AB|CD/.test(t)) t = t.replace(/AB|CD/, '')
  return t.length
}

test('2696 random strings match a repeated-deletion oracle', () => {
  let seed = 2696
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(16) }, () => 'ABCD'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
