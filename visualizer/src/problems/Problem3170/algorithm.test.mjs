import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('3170 official examples', () => {
  assert.equal(solve('aaba*'), 'aab')
  assert.equal(solve('abc'), 'abc')
})

test('3170 small cases and ties', () => {
  assert.equal(solve('a*'), '')
  assert.equal(solve('ab*'), 'b')
  // Two equal letters tie; removing the rightmost leaves the smaller result.
  assert.equal(solve('aba*'), 'ab')
})

test('3170 rejects a star with no letter to its left', () => {
  assert.throws(() => parseInput('{"s": "*a"}'))
  assert.throws(() => parseInput('{"s": "A"}'))
})

// Independent oracle: each step removes the leftmost star and one smallest letter to its left (any tie),
// and every tie choice is explored, keeping the smallest final string.
function oracle(s) {
  if (!s.includes('*')) return s
  const i = s.indexOf('*')
  let low = null
  for (let j = 0; j < i; j++) if (low === null || s[j] < low) low = s[j]
  let best = null
  for (let j = 0; j < i; j++) {
    if (s[j] !== low) continue
    const next = s.slice(0, j) + s.slice(j + 1, i) + s.slice(i + 1)
    const candidate = oracle(next)
    if (best === null || candidate < best) best = candidate
  }
  return best
}

test('3170 random strings match an all-choices oracle', () => {
  let seed = 3170
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 600 && checked < 200; t++) {
    const s = Array.from({ length: 1 + rnd(9) }, () => (rnd(4) === 0 ? '*' : 'abc'[rnd(3)])).join('')
    try { parseInput(JSON.stringify({ s })) } catch { continue }
    checked++
    assert.equal(solve(s), oracle(s), s)
  }
  assert.ok(checked >= 100)
})
