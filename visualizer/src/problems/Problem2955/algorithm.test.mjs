import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (s, queries) => buildTrace({ s, queries }).result
const pyLines = python.trim().split('\n').length

test('2955 teaching examples', () => {
  assert.deepEqual(solve('abcabca', [[0, 6], [1, 3], [2, 2]]), [12, 3, 1])
  assert.deepEqual(solve('zzyz', [[0, 3], [1, 2]]), [7, 2])
  assert.deepEqual(solve('a', [[0, 0]]), [1])
})

test('2955 parser rejects bad ranges', () => {
  assert.throws(() => parseInput('{"s":"ab","queries":[[1,0]]}'))
  assert.throws(() => parseInput('{"s":"ab","queries":[[0,2]]}'))
  assert.throws(() => parseInput('{"s":"ab","queries":[]}'))
  assert.throws(() => parseInput('{"s":"Ab","queries":[[0,1]]}'))
})

// Brute oracle: enumerate every substring of the range and compare its two ends.
function oracle(s, [l, r]) {
  let count = 0
  for (let i = l; i <= r; i++) for (let j = i; j <= r; j++) if (s[i] === s[j]) count++
  return count
}

test('2955 random strings and ranges match the substring oracle', () => {
  let seed = 2955
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcd'
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(14) }, () => letters[rnd(4)]).join('')
    const queries = Array.from({ length: 1 + rnd(4) }, () => {
      const l = rnd(s.length)
      return [l, l + rnd(s.length - l)]
    })
    assert.deepEqual(solve(s, queries), queries.map(q => oracle(s, q)), JSON.stringify({ s, queries }))
  }
})

test('2955 frames keep valid lines and one answer per query', () => {
  const run = buildTrace({ s: 'abcabca', queries: [[0, 6], [1, 3], [2, 2]] })
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
  }
  assert.equal(run.frames.filter(f => f.phase === 'answer').length, 3)
})
