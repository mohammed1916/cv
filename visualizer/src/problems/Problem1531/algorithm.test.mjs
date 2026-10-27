import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('1531 official examples', () => {
  assert.equal(solve('aaabcccd', 2), 4)
  assert.equal(solve('aabbaa', 2), 2)
  assert.equal(solve('aaaaaaaaaaa', 0), 3)
})

test('1531 deleting a letter can shorten a count from two digits to one', () => {
  // "aaaaaaaaaaa" has 11 a's, encoded as "a11" (3 characters). Deleting one leaves "a10" (3), deleting two leaves "a9" (2).
  assert.equal(solve('aaaaaaaaaaa', 2), 2)
})

test('1531 rejects a deletion count larger than the string', () => {
  assert.throws(() => parseInput('{"s":"ab","k":3}'))
})

// Independent oracle: try every set of deletions of size at most k and measure the run-length encoding directly.
function oracle(s, k) {
  const n = s.length
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let deleted = 0
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) deleted++
    if (deleted > k) continue
    const kept = [...s].filter((_, i) => !((mask >> i) & 1)).join('')
    let length = 0
    for (let i = 0; i < kept.length;) {
      let j = i
      while (j < kept.length && kept[j] === kept[i]) j++
      const count = j - i
      length += count === 1 ? 1 : 1 + String(count).length
      i = j
    }
    best = Math.min(best, length)
  }
  return best
}

test('1531 seeded random strings match an explicit deletion search', () => {
  let seed = 1531
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(10)
    const s = Array.from({ length }, () => 'abc'[rnd(3)]).join('')
    const k = rnd(length + 1)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
