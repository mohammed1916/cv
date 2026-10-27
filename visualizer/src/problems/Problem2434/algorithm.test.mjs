import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('2434 official examples', () => {
  assert.equal(solve('zza'), 'azz')
  assert.equal(solve('bac'), 'abc')
  assert.equal(solve('bdda'), 'addb')
})

test('2434 rejects uppercase and empty input', () => {
  assert.throws(() => parseInput('"Ab"'))
  assert.throws(() => parseInput('""'))
})

// Independent oracle: search every legal sequence of push and pop moves and keep the smallest printed string.
function oracle(s) {
  let best = null
  const go = (i, t, paper) => {
    if (i === s.length && t.length === 0) {
      if (best === null || paper < best) best = paper
      return
    }
    if (i < s.length) go(i + 1, t + s[i], paper)
    if (t.length) go(i, t.slice(0, -1), paper + t[t.length - 1])
  }
  go(0, '', '')
  return best
}

test('2434 random strings match an exhaustive move-sequence oracle', () => {
  let seed = 2434
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    let s = ''
    const len = 1 + rnd(7)
    for (let i = 0; i < len; i++) s += String.fromCharCode(97 + rnd(4))
    assert.equal(solve(s), oracle(s), s)
  }
})
