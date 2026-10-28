import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3438 examples', () => {
  assert.equal(solve('2523533'), '23')
  assert.equal(solve('221'), '21')
  assert.equal(solve('22'), '')
})

test('3438 a pair of equal digits never counts', () => {
  assert.equal(solve('1111'), '')
})

test('3438 rejects letters and short input', () => {
  assert.throws(() => parseInput('{"s":"1a"}'))
  assert.throws(() => parseInput('{"s":"1"}'))
})

// Independent oracle: test each adjacent pair by counting occurrences with split.
function oracle(s) {
  const occurrences = d => s.split(String(d)).length - 1
  for (let i = 0; i + 1 < s.length; i++) {
    const a = Number(s[i])
    const b = Number(s[i + 1])
    if (a !== b && occurrences(a) === a && occurrences(b) === b) return `${a}${b}`
  }
  return ''
}

test('3438 random digit strings match a split-count oracle', () => {
  let seed = 3438
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(29)
    let s = ''
    for (let i = 0; i < len; i++) s += '1123'[rnd(4)]
    assert.equal(solve(s), oracle(s), s)
  }
})
