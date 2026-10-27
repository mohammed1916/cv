import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (str1, str2) => buildTrace(parseInput(JSON.stringify({ str1, str2 }))).result

function isSubsequence(small, big) {
  let k = 0
  for (const ch of big) if (k < small.length && small[k] === ch) k++
  return k === small.length
}

test('1092 official-style examples', () => {
  const abac = solve('abac', 'cab')
  assert.equal(abac.length, 5)
  assert.ok(isSubsequence('abac', abac) && isSubsequence('cab', abac))
  assert.equal(solve('aaaaaaaa', 'aaaaaaaa'), 'aaaaaaaa')
})

test('1092 one empty side is impossible and equal strings merge completely', () => {
  assert.equal(solve('a', 'b'), 'ab')
  assert.equal(solve('abc', 'abc'), 'abc')
  assert.throws(() => parseInput(JSON.stringify({ str1: '', str2: 'a' })))
})

// Independent oracle: the shortest common supersequence length is |a| + |b| - LCS(a, b), with
// LCS from a separate prefix table. The solution must match that length and contain both strings.
function lcs(a, b) {
  const t = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      t[i][j] = a[i - 1] === b[j - 1] ? t[i - 1][j - 1] + 1 : Math.max(t[i - 1][j], t[i][j - 1])
    }
  }
  return t[a.length][b.length]
}

test('1092 random strings match an LCS-based length oracle and are valid supersequences', () => {
  let seed = 1092
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const str1 = word(1 + rnd(7))
    const str2 = word(1 + rnd(7))
    const answer = solve(str1, str2)
    assert.equal(answer.length, str1.length + str2.length - lcs(str1, str2), `${str1} ${str2}`)
    assert.ok(isSubsequence(str1, answer) && isSubsequence(str2, answer), `${str1} ${str2} -> ${answer}`)
  }
})
