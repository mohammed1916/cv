import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace({ num }).result

test('2844 worked examples', () => {
  assert.equal(solve('2245'), 1)
  assert.equal(solve('100'), 0)
})

test('2844 edge cases', () => {
  assert.equal(solve('0'), 0)
  assert.equal(solve('7'), 1)
  assert.equal(solve('10'), 1)
  assert.equal(solve('25'), 0)
  assert.equal(solve('2908'), 3)
})

test('2844 rejects malformed input', () => {
  assert.throws(() => parseInput('{"num":"0025"}'))
  assert.throws(() => parseInput('{"num":"1a"}'))
})

// Independent oracle: try every kept subsequence and test divisibility by 25.
function oracle(num) {
  const n = num.length
  let bestKept = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let kept = ''
    for (let i = 0; i < n; i++) if (mask & (1 << i)) kept += num[i]
    const value = kept === '' ? 0 : Number(kept)
    if (value % 25 === 0 && kept.length > bestKept) bestKept = kept.length
  }
  return n - bestKept
}

test('2844 random inputs match a subsequence oracle', () => {
  let seed = 2844
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(9)
    let num = String(1 + rnd(9))
    for (let i = 1; i < len; i++) num += String(rnd(10))
    assert.equal(solve(num), oracle(num), num)
  }
})
