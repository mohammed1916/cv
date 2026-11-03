import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (beginWord, endWord, wordList) => buildTrace({ beginWord, endWord, wordList }).result

test('127 sample ladders have the expected lengths', () => {
  assert.equal(solve('cat', 'dog', ['cot', 'dot', 'dog']), 4)
  assert.equal(solve('ab', 'ad', ['ac', 'ad']), 2)
  assert.equal(solve('ab', 'cd', ['ac', 'bc', 'cc', 'cd']), 4)
  assert.equal(solve('ab', 'cd', ['ac', 'cb']), 0)
})

test('127 missing end word and disconnected groups give zero', () => {
  assert.equal(solve('cat', 'dog', ['cot', 'dot']), 0)
  assert.equal(solve('aaa', 'bbb', ['xxx', 'bbb']), 0)
})

test('127 rejects malformed input', () => {
  assert.throws(() => parseInput('{"beginWord":"ab","endWord":"abc","wordList":["ab"]}'), /length/)
  assert.throws(() => parseInput('{"beginWord":"ab","endWord":"cd","wordList":["ac","ac"]}'), /distinct/)
  assert.throws(() => parseInput('{"beginWord":"ab","endWord":"ab","wordList":["ac"]}'), /differ/)
  assert.throws(() => parseInput('[1]'), /object/)
})

// Independent oracle: plain BFS over all words that differ in exactly one letter.
test('127 random inputs match a plain BFS oracle', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  const oneApart = (a, b) => a.length === b.length && [...a].filter((c, i) => c !== b[i]).length === 1
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(3)
    const pool = [...new Set(Array.from({ length: 2 + rnd(8) }, () => word(len)))]
    const beginWord = word(len)
    const endWord = word(len)
    if (beginWord === endWord) continue
    const input = JSON.stringify({ beginWord, endWord, wordList: pool })
    parseInput(input)
    const nodes = [beginWord, ...pool.filter(w => w !== beginWord)]
    const dist = new Map([[beginWord, 1]])
    const queue = [beginWord]
    for (let h = 0; h < queue.length; h++) {
      const cur = queue[h]
      for (const nx of nodes) if (!dist.has(nx) && oneApart(cur, nx)) { dist.set(nx, dist.get(cur) + 1); queue.push(nx) }
    }
    const expected = pool.includes(endWord) ? (dist.get(endWord) ?? 0) : 0
    assert.equal(solve(beginWord, endWord, pool), expected, input)
  }
})
