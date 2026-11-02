import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, binomial } from './algorithm.js'

const solve = s => buildTrace(s).result

test('2539 worked examples', () => {
  // aabb: k=1 gives (1+2)(1+2)-1 = 8; k=2 gives (1+1)(1+1)-1 = 3; total 11.
  assert.equal(solve('aabb'), 11)
  assert.equal(solve('aaa'), 7)
  assert.equal(solve('a'), 1)
})

test('2539 rejects non-lowercase input', () => {
  assert.throws(() => parseInput('"aB"'))
  assert.throws(() => parseInput('""'))
})

test('2539 binomial table matches small known values', () => {
  assert.equal(binomial(5, 2), 10)
  assert.equal(binomial(4, 0), 1)
  assert.equal(binomial(3, 5), 0)
})

// Oracle: enumerate every nonempty index subset and test the frequency condition directly.
function oracle(s) {
  const n = s.length
  let total = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const freq = {}
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) freq[s[i]] = (freq[s[i]] || 0) + 1
    const values = Object.values(freq)
    if (values.every(v => v === values[0])) total++
  }
  return total % 1000000007
}

test('2539 random strings match an index-subset oracle', () => {
  let seed = 2539
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 200; t++) {
    const s = Array.from({ length: 1 + rnd(10) }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
