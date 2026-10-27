import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2486 official examples', () => {
  assert.equal(solve({ s: 'coaching', t: 'coding' }), 4)
  assert.equal(solve({ s: 'abcde', t: 'a' }), 0)
  assert.equal(solve({ s: 'z', t: 'abcde' }), 5)
})

test('2486 repeated letters of t need repeated letters of s', () => {
  assert.equal(solve({ s: 'ab', t: 'bb' }), 1)
})

test('2486 rejects characters outside a to z', () => {
  assert.throws(() => parseInput('{"s":"a1","t":"a"}'))
})

// Independent oracle: t is a subsequence of w if some set of positions of w spells t.
function isSubsequenceBySubsets(t, w) {
  for (let mask = 0; mask < 1 << w.length; mask++) {
    let picked = ''
    for (let b = 0; b < w.length; b++) if (mask & (1 << b)) picked += w[b]
    if (picked === t) return true
  }
  return false
}

// Oracle: try suffix lengths k = 0, 1, ... and use the first one that makes t a subsequence of s plus the last k letters of t.
function oracle(s, t) {
  for (let k = 0; k <= t.length; k++) {
    if (isSubsequenceBySubsets(t, s + t.slice(t.length - k))) return k
  }
  return t.length
}

test('2486 random strings match a brute-force oracle', () => {
  let seed = 2486
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const s = word(1 + rnd(6))
    const tt = word(1 + rnd(5))
    assert.equal(solve({ s, t: tt }), oracle(s, tt), `${s} ${tt}`)
  }
})
