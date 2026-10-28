import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = word => buildTrace(parseInput(JSON.stringify({ word }))).result

test('3163 examples', () => {
  assert.equal(solve('abcde'), '1a1b1c1d1e')
  assert.equal(solve('aaaaaaaaaaaaaaabc'), '9a6a1b1c')
})

test('3163 a run is cut after nine copies', () => {
  assert.equal(solve('aaaaaaaaa'), '9a')
  assert.equal(solve('aaaaaaaaaa'), '9a1a')
})

test('3163 rejects uppercase letters and extra keys', () => {
  assert.throws(() => parseInput('{"word":"Ab"}'))
  assert.throws(() => parseInput('{"word":"ab","x":1}'))
})

// Independent oracle: find maximal runs with a regular expression, then cut each run into chunks of at most nine.
function oracle(word) {
  let out = ''
  for (const [run] of word.matchAll(/([a-z])\1*/g)) {
    let left = run.length
    while (left > 0) {
      const take = Math.min(9, left)
      out += `${take}${run[0]}`
      left -= take
    }
  }
  return out
}

test('3163 random words match a regular expression oracle', () => {
  let seed = 3163
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(30)
    let word = ''
    for (let i = 0; i < len; i++) word += 'abc'[rnd(3)]
    assert.equal(solve(word), oracle(word), word)
  }
})
