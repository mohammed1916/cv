import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (str1, str2) => buildTrace(parseInput(JSON.stringify({ str1, str2 }))).result

test('2825 official examples', () => {
  assert.equal(solve('abc', 'ad'), true)
  assert.equal(solve('zc', 'ad'), true)
  assert.equal(solve('ab', 'd'), false)
})

test('2825 z wraps around to a', () => {
  assert.equal(solve('z', 'a'), true)
  assert.equal(solve('a', 'z'), false)
})

test('2825 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"str1":"AB","str2":"a"}'))
})

// Independent oracle: try every subset of positions to increment, then test subsequence by enumerating index subsets.
function oracle(str1, str2) {
  const n = str1.length
  for (let mask = 0; mask < 1 << n; mask++) {
    let w = ''
    for (let b = 0; b < n; b++) {
      const c = str1[b]
      w += mask & (1 << b) ? String.fromCharCode(((c.charCodeAt(0) - 97 + 1) % 26) + 97) : c
    }
    for (let sub = 0; sub < 1 << n; sub++) {
      let picked = ''
      for (let b = 0; b < n; b++) if (sub & (1 << b)) picked += w[b]
      if (picked === str2) return true
    }
  }
  return false
}

test('2825 random strings match a brute-force oracle', () => {
  let seed = 2825
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abcz'[rnd(4)]).join('')
  for (let t = 0; t < 200; t++) {
    const str1 = word(1 + rnd(5))
    const str2 = word(1 + rnd(3))
    assert.equal(solve(str1, str2), oracle(str1, str2), `${str1} ${str2}`)
  }
})
