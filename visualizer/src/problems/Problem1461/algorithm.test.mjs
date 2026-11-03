import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('1461 sample strings give the expected answers', () => {
  assert.equal(solve('00110110', 2), true)
  assert.equal(solve('0110', 1), true)
  assert.equal(solve('0110', 2), false)
  assert.equal(solve('0000', 2), false)
})

test('1461 too few windows is rejected before scanning', () => {
  const { frames, result } = buildTrace({ s: '0101', k: 3 })
  assert.equal(result, false)
  assert.equal(frames.length, 2)
  assert.equal(frames.at(-1).phase, 'done')
})

test('1461 early success stops at the window that completes the set', () => {
  const { frames, result } = buildTrace({ s: '0011', k: 1 })
  assert.equal(result, true)
  assert.equal(frames.at(-1).snapshot.start, 2)
})

test('1461 rejects malformed input', () => {
  assert.throws(() => parseInput('"01"'), /object/)
  assert.throws(() => parseInput('{"s":"012","k":2}'), /s is/)
  assert.throws(() => parseInput('{"s":"01","k":0}'), /k is/)
  assert.throws(() => parseInput('{"s":"01","k":13}'), /k is/)
})

// Independent oracle: test each of the 2^k binary strings of length k as a substring.
test('1461 random binary strings match a substring oracle', () => {
  let seed = 21
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const k = 1 + rnd(3)
    const len = 1 + rnd(20)
    const s = Array.from({ length: len }, () => (rnd(2) ? '1' : '0')).join('')
    let all = true
    for (let c = 0; c < 2 ** k; c++) {
      const code = c.toString(2).padStart(k, '0')
      if (!s.includes(code)) { all = false; break }
    }
    assert.equal(solve(s, k), all, `${s} ${k}`)
  }
})
