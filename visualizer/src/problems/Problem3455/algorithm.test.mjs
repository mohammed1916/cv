import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, p) => buildTrace({ s, p }).result

test('3455 worked examples', () => {
  assert.equal(solve('abc', 'a**c'), 3)
  assert.equal(solve('abcbc', 'a*bc*'), 3)
  assert.equal(solve('aaa', 'a**'), 1)
  assert.equal(solve('xyz', 'a*b*c'), -1)
})

test('3455 an empty middle and suffix still need the prefix', () => {
  assert.equal(solve('ba', '**'), 0)
  assert.equal(solve('bcd', 'b**'), 1)
})

test('3455 rejects a pattern without exactly two stars', () => {
  assert.throws(() => parseInput('{"s":"abc","p":"a*c"}'))
  assert.throws(() => parseInput('{"s":"abc","p":"a*b*c*"}'))
})

// Independent oracle: test every substring against the pattern with a glob DP.
function globMatches(t, p) {
  const n = t.length, m = p.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(false))
  dp[0][0] = true
  for (let j = 1; j <= m; j++) {
    for (let i = 0; i <= n; i++) {
      if (p[j - 1] === '*') dp[j][i] = dp[j - 1][i] || (i > 0 && dp[j][i - 1])
      else dp[j][i] = i > 0 && dp[j - 1][i - 1] && t[i - 1] === p[j - 1]
    }
  }
  return dp[m][n]
}
function oracle(s, p) {
  let best = -1
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j <= s.length; j++) {
      if (globMatches(s.slice(i, j), p) && (best === -1 || j - i < best)) best = j - i
    }
  }
  return best
}

test('3455 random strings match a substring-enumeration oracle', () => {
  let seed = 3455
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const s = word(1 + rnd(8))
    const p = `${word(rnd(3))}*${word(rnd(3))}*${word(rnd(3))}`
    assert.equal(solve(s, p), oracle(s, p), `${s} ${p}`)
  }
})
