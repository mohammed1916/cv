import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3316 official examples', () => {
  assert.equal(solve('{"source":"abbaa","pattern":"aba","targetIndices":[0,1,2]}'), 1)
  assert.equal(solve('{"source":"bcda","pattern":"d","targetIndices":[0,3]}'), 2)
  assert.equal(solve('{"source":"dda","pattern":"dda","targetIndices":[0,1,2]}'), 0)
})

test('3316 rejects a pattern that is not a subsequence of source', () => {
  assert.throws(() => parseInput('{"source":"abc","pattern":"ca","targetIndices":[]}'), /subsequence/)
})

const isSubsequence = (pattern, text) => {
  let j = 0
  for (const ch of text) if (j < pattern.length && ch === pattern[j]) j++
  return j === pattern.length
}

// Independent oracle: try every subset of targets to delete and keep the largest one that leaves the pattern intact.
function oracle({ source, pattern, targetIndices }) {
  let bestCount = 0
  for (let mask = 0; mask < 1 << targetIndices.length; mask++) {
    const removed = new Set(targetIndices.filter((_, b) => mask & (1 << b)))
    const rest = [...source].filter((_, i) => !removed.has(i)).join('')
    if (isSubsequence(pattern, rest) && removed.size > bestCount) bestCount = removed.size
  }
  return bestCount
}

test('3316 seeded random cases match a subset oracle', () => {
  let seed = 3316
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    let source = ''
    for (let i = 0; i < len; i++) source += rnd(2) ? 'a' : 'b'
    let pattern = ''
    for (const ch of source) if (rnd(2)) pattern += ch
    if (!pattern) pattern = source[0]
    const targetIndices = []
    for (let i = 0; i < len; i++) if (rnd(2)) targetIndices.push(i)
    const input = { source, pattern, targetIndices }
    const text = JSON.stringify(input)
    assert.equal(solve(text), oracle(input), text)
  }
})
