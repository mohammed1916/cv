import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(s).result

test('2734 official examples', () => {
  assert.equal(solve('cbabc'), 'baabc')
  assert.equal(solve('acbbc'), 'abaab')
  assert.equal(solve('leetcode'), 'kddsbncd')
})

test('2734 all a letters change only the last one', () => {
  assert.equal(solve('aaa'), 'aaz')
  assert.equal(solve('a'), 'z')
})

test('2734 rejects characters outside a to z', () => {
  assert.throws(() => parseInput('"ab1"'))
})

// Independent oracle: try every non-empty substring, shift it, and keep the smallest result.
function oracle(s) {
  let best = null
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const shifted = [...s].map((ch, k) => (k >= i && k <= j ? String.fromCharCode(ch === 'a' ? 122 : ch.charCodeAt(0) - 1) : ch)).join('')
      if (best === null || shifted < best) best = shifted
    }
  }
  return best
}

test('2734 random strings match the substring oracle', () => {
  let seed = 2734
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    let s = ''
    const len = 1 + rnd(8)
    for (let i = 0; i < len; i++) s += String.fromCharCode(97 + rnd(5))
    assert.equal(solve(s), oracle(s), s)
  }
})
