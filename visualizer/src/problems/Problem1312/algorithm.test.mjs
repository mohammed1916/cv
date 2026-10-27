import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('1312 official examples', () => {
  assert.equal(solve('zzazz'), 0)
  assert.equal(solve('mbadm'), 2)
  assert.equal(solve('leetcode'), 5)
})

test('1312 single letters and tiny strings', () => {
  assert.equal(solve('a'), 0)
  assert.equal(solve('ab'), 1)
  assert.equal(solve('aa'), 0)
})

test('1312 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":""}'))
  assert.throws(() => parseInput('{"s":"Ab"}'))
  assert.throws(() => parseInput('{"s":"abcdefghijk"}'))
})

// Independent oracle: the fewest insertions equal the length minus the longest common subsequence
// of the string and its reverse, which is a different computation from the interval table.
function oracle(s) {
  const r = [...s].reverse().join('')
  const n = s.length
  const lcs = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= n; j++) {
      lcs[i][j] = s[i - 1] === r[j - 1] ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1])
    }
  }
  return n - lcs[n][n]
}

test('1312 random strings match the longest-common-subsequence oracle', () => {
  let seed = 1312
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(10)
    const s = Array.from({ length }, () => 'abcd'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
