import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, target) => buildTrace(parseInput(JSON.stringify({ s, target }))).result

test('3720 official examples', () => {
  assert.equal(solve('abc', 'bba'), 'bca')
  assert.equal(solve('leet', 'code'), 'eelt')
  assert.equal(solve('baba', 'bbaa'), '')
})

test('3720 the answer must be strictly greater', () => {
  assert.equal(solve('ab', 'ab'), 'ba')
  assert.equal(solve('ab', 'ba'), '')
})

test('3720 rejects unequal lengths', () => {
  assert.throws(() => parseInput('{"s":"ab","target":"abc"}'))
})

// Independent oracle: list every distinct permutation of s, keep those above target, take the minimum.
function oracle(s, target) {
  const out = new Set()
  const walk = (prefix, rest) => {
    if (!rest.length) { out.add(prefix); return }
    for (let i = 0; i < rest.length; i++) walk(prefix + rest[i], rest.slice(0, i) + rest.slice(i + 1))
  }
  walk('', s)
  const above = [...out].filter(p => p > target).sort()
  return above.length ? above[0] : ''
}

let seed = 3720
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3720 seeded random against permutation oracle', () => {
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(5)
    const L = () => String.fromCharCode(97 + rnd(4))
    const s = Array.from({ length: n }, L).join('')
    const target = Array.from({ length: n }, L).join('')
    assert.equal(solve(s, target), oracle(s, target), JSON.stringify({ s, target }))
  }
})
