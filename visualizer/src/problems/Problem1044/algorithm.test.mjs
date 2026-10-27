import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('1044 examples', () => {
  assert.equal(solve('banana'), 'ana')
  assert.equal(solve('abcd'), '')
  assert.equal(solve('aaaa'), 'aaa')
  assert.equal(solve('abab'), 'ab')
})

test('1044 rejects non-letters', () => {
  assert.throws(() => parseInput('"ab1"'))
  assert.throws(() => parseInput('""'))
})

// Independent oracle: for every length from longest to shortest, count every window and keep the smallest repeat.
function oracle(s) {
  for (let len = s.length - 1; len >= 1; len--) {
    const counts = new Map()
    for (let i = 0; i + len <= s.length; i++) {
      const w = s.slice(i, i + len)
      counts.set(w, (counts.get(w) || 0) + 1)
    }
    const repeats = [...counts].filter(([, c]) => c >= 2).map(([w]) => w).sort()
    if (repeats.length) return repeats[0]
  }
  return ''
}

test('1044 random strings match a window-count oracle', () => {
  let seed = 1044
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(20)
    let s = ''
    for (let i = 0; i < len; i++) s += String.fromCharCode(97 + rnd(3))
    assert.equal(solve(s), oracle(s), s)
  }
})
