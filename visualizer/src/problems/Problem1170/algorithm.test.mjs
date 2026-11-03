import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, letterScore, parseInput } from './algorithm.js'

// Independent oracle: compute the smallest character code by a numeric scan, then count occurrences with a loop.
function oracleScore(s) {
  let low = 'z'.charCodeAt(0) + 1
  for (let i = 0; i < s.length; i++) low = Math.min(low, s.charCodeAt(i))
  let count = 0
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) === low) count++
  return count
}
function oracle(queries, words) {
  const scores = words.map(oracleScore)
  return queries.map(q => {
    const t = oracleScore(q)
    let n = 0
    for (const s of scores) if (s > t) n++
    return n
  })
}

test('the sample scores are 1, 3, 4 for the queries and 2, 1, 3, 1 for the words', () => {
  assert.equal(letterScore('cbd'), 1)
  assert.equal(letterScore('zzz'), 3)
  assert.equal(letterScore('aaaa'), 4)
  assert.equal(letterScore('cc'), 2)
  assert.equal(letterScore('abcd'), 1)
})

test('sample input gives 2, 0, 0', () => {
  assert.deepEqual(buildTrace({ queries: ['cbd', 'zzz', 'aaaa'], words: ['cc', 'ab', 'bbb', 'abcd'] }).result, [2, 0, 0])
})

test('equal scores do not count', () => {
  // The query 'ab' has score 1. 'ax' ties at 1 and 'c' has 1 too, so only 'bb' (score 2) counts.
  assert.deepEqual(buildTrace({ queries: ['ab'], words: ['bb', 'ax', 'c'] }).result, [1])
})

test('random queries and words agree with the oracle', () => {
  let state = 23
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const word = () => Array.from({ length: 1 + rand(10) }, () => String.fromCharCode(97 + rand(5))).join('')
  for (let t = 0; t < 150; t++) {
    const queries = Array.from({ length: 1 + rand(8) }, word)
    const words = Array.from({ length: 1 + rand(12) }, word)
    assert.deepEqual(buildTrace({ queries, words }).result, oracle(queries, words), JSON.stringify({ queries, words }))
  }
})

test('frames end with the answers and each query frame shows its target', () => {
  const run = buildTrace({ queries: ['cbd', 'zzz'], words: ['cc', 'bbb'] })
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).snapshot.answers, run.result)
  const targets = run.frames.filter(f => f.phase === 'query' && f.activeLine === 6).map(f => f.snapshot.target)
  assert.deepEqual(targets, [1, 3])
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 7)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[]'), /JSON object/)
  assert.throws(() => parseInput({ queries: [], words: ['a'] }), /queries must be/)
  assert.throws(() => parseInput({ queries: ['a'], words: ['A'] }), /words\[0\] must be/)
  assert.throws(() => parseInput({ queries: ['a'], words: ['abcdefghijk'] }), /words\[0\] must be/)
})
