import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('2311 official examples', () => {
  assert.equal(solve('1001010', 5), 5)
  assert.equal(solve('00101001', 1), 6)
})

test('2311 small cases', () => {
  assert.equal(solve('1', 1), 1)
  assert.equal(solve('0', 1), 1)
  // "11" has value 3 at full length and "1" alone fits, so the longest is 1.
  assert.equal(solve('11', 2), 1)
})

test('2311 rejects bad input', () => {
  assert.throws(() => parseInput('{"s": "102", "k": 5}'), /binary/)
  assert.throws(() => parseInput('{"s": "101", "k": 0}'), /integer/)
  assert.throws(() => parseInput('{"s": "101"}'), /keys/)
})

// Independent oracle: try every subsequence of the bits and keep the longest one whose value is at most k.
function oracle(s, k) {
  let best = 0
  for (let mask = 0; mask < 1 << s.length; mask++) {
    let value = 0
    let length = 0
    for (let i = 0; i < s.length; i++) {
      if (mask & (1 << i)) {
        value = value * 2 + Number(s[i])
        length += 1
      }
    }
    if (value <= k) best = Math.max(best, length)
  }
  return best
}

test('2311 random binary strings match a subsequence oracle', () => {
  let seed = 2311
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    let s = ''
    for (let i = 0; i < len; i++) s += '01'[rnd(2)]
    const k = 1 + rnd(200)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
