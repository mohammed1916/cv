import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (source, target) => buildTrace({ source, target }).result
const pyLines = python.split('\n').length

test('1055 worked examples', () => {
  assert.equal(solve('abc', 'abcbc'), 2)
  assert.equal(solve('abc', 'acdbc'), -1)
  assert.equal(solve('xyz', 'xzyxz'), 3)
})

test('1055 edge cases', () => {
  assert.equal(solve('abc', ''), 0)
  assert.equal(solve('', 'a'), -1)
  assert.equal(solve('abc', 'abc'), 1)
  assert.equal(solve('a', 'aaaa'), 4)
})

test('1055 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace({ source: 'abc', target: 'abcbc' })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1055 rejects overlong input', () => {
  assert.throws(() => parseInput('{"source":"abc","target":"abcdefghijklmn"}'))
  assert.throws(() => parseInput('["abc","abc"]'))
})

// Oracle: split target into contiguous chunks and find the fewest chunks, each a subsequence of source.
function isSubsequence(part, source) {
  let k = 0
  for (const ch of source) if (k < part.length && ch === part[k]) k++
  return k === part.length
}
function oracle(source, target) {
  const n = target.length
  const dp = Array(n + 1).fill(Infinity)
  dp[0] = 0
  for (let end = 1; end <= n; end++) {
    for (let start = 0; start < end; start++) {
      if (dp[start] + 1 < dp[end] && isSubsequence(target.slice(start, end), source)) dp[end] = dp[start] + 1
    }
  }
  return dp[n] === Infinity ? -1 : dp[n]
}

test('1055 random strings match a contiguous-chunk oracle', () => {
  let seed = 1055
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 400; t++) {
    const source = word(rnd(7))
    const target = word(rnd(9))
    assert.equal(solve(source, target), oracle(source, target), JSON.stringify({ source, target }))
  }
})
