import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('676 official example', () => {
  assert.deepEqual(buildTrace({ words: ['hello', 'leetcode'], queries: ['hello', 'hhllo', 'hell', 'leetcoded'] }).result, [false, true, false, false])
})

test('676 random queries match a wildcard-key oracle', () => {
  let state = 71
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const word = () => Array.from({ length: 1 + rand(4) }, () => 'abc'[rand(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rand(5) }, word)
    const queries = Array.from({ length: 1 + rand(5) }, word)
    // Oracle: generate every one-letter replacement of the query and test membership in the dictionary.
    const set = new Set(words)
    const expected = queries.map(q => {
      for (let i = 0; i < q.length; i++) for (const c of 'abcdefghijklmnopqrstuvwxyz') {
        if (c !== q[i] && set.has(q.slice(0, i) + c + q.slice(i + 1))) return true
      }
      return false
    })
    assert.deepEqual(buildTrace({ words, queries }).result, expected, JSON.stringify({ words, queries }))
  }
})

test('676 rejects uppercase words', () => {
  assert.throws(() => parseInput('{"words":["Hi"],"queries":["hi"]}'))
})
