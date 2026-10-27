import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, t, k) => buildTrace({ s, t, k }).result

test('2851 worked examples', () => {
  assert.equal(solve('abcd', 'cdab', 2), 2)
  assert.equal(solve('ab', 'ba', 1), 1)
  assert.equal(solve('ab', 'ba', 2), 0)
  assert.equal(solve('ab', 'ab', 2), 1)
})

test('2851 a target that is not a rotation gives zero', () => {
  assert.equal(solve('abc', 'abd', 3), 0)
})

test('2851 rejects unequal lengths and k out of range', () => {
  assert.throws(() => parseInput('{"s":"ab","t":"abc","k":1}'))
  assert.throws(() => parseInput('{"s":"ab","t":"ba","k":0}'))
})

// Independent oracle: count operation sequences by walking every string, one step at a time.
function oracle(s, t, k) {
  const n = s.length
  let counts = new Map([[s, 1]])
  for (let step = 0; step < k; step++) {
    const next = new Map()
    for (const [x, c] of counts) {
      for (let l = 1; l < n; l++) {
        const y = x.slice(n - l) + x.slice(0, n - l)
        next.set(y, (next.get(y) || 0) + c)
      }
    }
    counts = next
  }
  return (counts.get(t) || 0) % 1000000007
}

test('2851 random strings match a step-by-step string count', () => {
  let seed = 2851
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(4)
    const s = word(n)
    const target = rnd(2) ? s.slice(n - 1 - rnd(n)) + s.slice(0, n - 1 - rnd(n)) : word(n)
    const fixed = target.length === n ? target : word(n)
    const k = 1 + rnd(6)
    assert.equal(solve(s, fixed, k), oracle(s, fixed, k), `${s} ${fixed} ${k}`)
  }
})
