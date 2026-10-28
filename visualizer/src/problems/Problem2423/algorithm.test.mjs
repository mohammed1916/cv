import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = word => buildTrace(parseInput(JSON.stringify(word))).result

test('2423 official examples', () => {
  assert.equal(solve('abcc'), true)
  assert.equal(solve('aazz'), false)
})

test('2423 a single removal must be made', () => {
  // Removing the lone b leaves a and c with equal counts.
  assert.equal(solve('abc'), true)
  // Counts 4, 2, 1: removing one letter never leaves all remaining counts equal.
  assert.equal(solve('aaaabbc'), false)
})

test('2423 rejects non-letters and bad lengths', () => {
  assert.throws(() => parseInput('"a"'))
  assert.throws(() => parseInput('"ab1"'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: try deleting every position and check the counts of what is left.
function oracle(word) {
  for (let i = 0; i < word.length; i++) {
    const rest = word.slice(0, i) + word.slice(i + 1)
    const counts = {}
    for (const ch of rest) counts[ch] = (counts[ch] ?? 0) + 1
    const distinct = new Set(Object.values(counts))
    if (distinct.size <= 1) return true
  }
  return false
}

test('2423 random words match a delete-each-position oracle', () => {
  let seed = 2423
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 2 + rnd(9)
    let word = ''
    for (let i = 0; i < len; i++) word += 'abcd'[rnd(4)]
    assert.equal(solve(word), oracle(word), word)
  }
})
