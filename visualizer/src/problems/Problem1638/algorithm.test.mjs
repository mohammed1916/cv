import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: enumerate every (start in s, start in t, length) and count one-mismatch pairs.
function oracle(s, t) {
  let total = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = 0; j < t.length; j++) {
      for (let len = 1; i + len <= s.length && j + len <= t.length; len++) {
        let diff = 0
        for (let k = 0; k < len; k++) if (s[i + k] !== t[j + k]) diff++
        if (diff === 1) total++
      }
    }
  }
  return total
}

test('a hand-made pair gives the expected count and matches the oracle', () => {
  const run = buildTrace(parseInput('["ab","ba"]'))
  assert.equal(run.result, oracle('ab', 'ba'))
  assert.equal(run.result, 2)
})

test('equal strings still count one-mismatch pairs of different letters', () => {
  const run = buildTrace(parseInput('["abc","abc"]'))
  assert.equal(run.result, oracle('abc', 'abc'))
  assert.equal(run.result, 6)
})

test('every short pair of strings over a three-letter alphabet agrees with the oracle', () => {
  const words = ['a', 'b', 'ab', 'ba', 'aa', 'abc', 'cab', 'bbb', 'aab', 'cca']
  for (const s of words) {
    for (const t of words) {
      assert.equal(buildTrace({ s, t }).result, oracle(s, t), `${s} / ${t}`)
    }
  }
})

test('random pairs of up to eight letters agree with the oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const word = () => Array.from({ length: 1 + rand(8) }, () => 'abc'[rand(3)]).join('')
  for (let t = 0; t < 200; t++) {
    const s = word(), u = word()
    assert.equal(buildTrace({ s, t: u }).result, oracle(s, u), `${s} / ${u}`)
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('["abc"]'))
  assert.throws(() => parseInput('["ABC","abc"]'))
  assert.throws(() => parseInput('["","abc"]'))
})
