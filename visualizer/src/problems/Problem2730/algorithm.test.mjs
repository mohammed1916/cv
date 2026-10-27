import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('2730 official examples', () => {
  assert.equal(solve('52233'), 4)
  assert.equal(solve('5494'), 4)
  assert.equal(solve('1111111'), 2)
})

test('2730 rejects non-digit text', () => {
  assert.throws(() => parseInput('{"s":"12a"}'))
})

// Independent oracle: check every substring by counting its equal adjacent pairs.
function oracle(s) {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      let pairs = 0
      for (let k = i + 1; k <= j; k++) if (s[k] === s[k - 1]) pairs++
      if (pairs <= 1) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

test('2730 seeded random strings match substring enumeration', () => {
  let seed = 2730
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(16)
    let s = ''
    for (let i = 0; i < length; i++) s += String(rnd(3))
    assert.equal(solve(s), oracle(s), s)
  }
})
