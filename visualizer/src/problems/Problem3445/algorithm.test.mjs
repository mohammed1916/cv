import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('3445 official examples', () => {
  assert.equal(solve('12233', 4), -1)
  assert.equal(solve('1122211', 3), 1)
  assert.equal(solve('110', 3), -1)
})

test('3445 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"12a","k":1}'))
  assert.throws(() => parseInput('{"s":"1122211","k":8}'))
  // "0000" has no odd count for any digit, so no valid substring exists.
  assert.throws(() => parseInput('{"s":"0000","k":1}'))
})

// Independent oracle: check every substring of length at least k directly by its counts.
function oracle(s, k) {
  let best = -Infinity
  for (let l = 0; l < s.length; l++) {
    const counts = Array(5).fill(0)
    for (let r = l; r < s.length; r++) {
      counts[Number(s[r])] += 1
      if (r - l + 1 < k) continue
      for (let a = 0; a <= 4; a++) {
        for (let b = 0; b <= 4; b++) {
          if (a === b) continue
          if (counts[a] % 2 === 1 && counts[b] > 0 && counts[b] % 2 === 0) best = Math.max(best, counts[a] - counts[b])
        }
      }
    }
  }
  return best
}

test('3445 random strings match a substring-count oracle', () => {
  let seed = 3445
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400; t++) {
    const len = 3 + rnd(12)
    const s = Array.from({ length: len }, () => String(rnd(5))).join('')
    const k = 1 + rnd(len)
    let expected
    try { expected = oracle(s, k) } catch { continue }
    if (!Number.isFinite(expected)) continue
    checked += 1
    assert.equal(solve(s, k), expected, `${s} ${k}`)
  }
  assert.ok(checked > 100)
})
