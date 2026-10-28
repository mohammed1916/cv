import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('3144 official examples', () => {
  assert.equal(solve('fabccddg'), 3)
  assert.equal(solve('abababaccddb'), 2)
})

test('3144 a balanced word is one piece', () => {
  assert.equal(solve('abab'), 1)
  assert.equal(solve('aabb'), 1)
})

test('3144 rejects characters outside a to z', () => {
  assert.throws(() => parseInput('"aB"'))
  assert.throws(() => parseInput('""'))
  assert.throws(() => parseInput('true'))
})

// Independent oracle: try every way to cut the string and keep the cut with the fewest pieces.
function oracle(s) {
  const balanced = piece => {
    const counts = {}
    for (const ch of piece) counts[ch] = (counts[ch] ?? 0) + 1
    const values = Object.values(counts)
    return values.every(v => v === values[0])
  }
  let best = Infinity
  const cut = (start, pieces) => {
    if (start === s.length) {
      best = Math.min(best, pieces)
      return
    }
    for (let end = start + 1; end <= s.length; end++) {
      if (balanced(s.slice(start, end))) cut(end, pieces + 1)
    }
  }
  cut(0, 0)
  return best
}

test('3144 random strings match an all-partitions oracle', () => {
  let seed = 3144
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abc'[rnd(3)]
    assert.equal(solve(s), oracle(s), s)
  }
})
