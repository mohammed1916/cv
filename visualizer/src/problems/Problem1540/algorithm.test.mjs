import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, t, k) => buildTrace(parseInput(JSON.stringify({ s, t, k }))).result

test('1540 sample inputs give the expected answers', () => {
  assert.equal(solve('abc', 'bcd', 60), true)
  assert.equal(solve('aaaa', 'bbbb', 3), false)
  assert.equal(solve('ab', 'ab', 0), true)
  assert.equal(solve('abc', 'abcd', 100), false)
})

test('1540 repeated shifts are scheduled at d, d+26, d+52', () => {
  assert.equal(solve('aaa', 'bbb', 53), true)
  assert.equal(solve('aaa', 'bbb', 52), false)
})

test('1540 rejects malformed input', () => {
  assert.throws(() => parseInput('{"s":"AB","t":"ab","k":1}'), /lowercase/)
  assert.throws(() => parseInput('{"s":"a","t":"b","k":-1}'), /k/)
})

// Brute-force oracle: try every assignment of distinct move numbers in 1..k with the right residue.
function brute(s, t, k) {
  if (s.length !== t.length) return false
  const need = []
  for (let i = 0; i < s.length; i++) {
    const d = (t.charCodeAt(i) - s.charCodeAt(i) + 26) % 26
    if (d) need.push(d)
  }
  const used = new Set()
  const go = idx => {
    if (idx === need.length) return true
    for (let x = 1; x <= k; x++) {
      if (x % 26 !== need[idx] || used.has(x)) continue
      used.add(x)
      if (go(idx + 1)) return true
      used.delete(x)
    }
    return false
  }
  return go(0)
}

test('1540 random small cases match a brute-force oracle', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abc'
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(5)
    const s = Array.from({ length: len }, () => letters[rnd(3)]).join('')
    const u = Array.from({ length: len }, () => letters[rnd(3)]).join('')
    const k = rnd(60)
    assert.equal(solve(s, u, k), brute(s, u, k), JSON.stringify({ s, u, k }))
  }
})
