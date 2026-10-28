import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('2522 hand-checked examples', () => {
  // 16 | 5 | 46 | 2: 62 and 54 are too large with 3 pieces, so 4 pieces are needed.
  assert.equal(solve('165462', 60), 4)
  // Every piece containing an 8 is at least 80, so no partition works.
  assert.equal(solve('238182', 5), -1)
  assert.equal(solve('1', 1), 1)
})

test('2522 a substring that starts with 0 is never allowed', () => {
  assert.equal(solve('0', 5), -1)
  assert.equal(solve('10', 1), -1)
})

test('2522 rejects non-digit strings and k out of range', () => {
  assert.throws(() => parseInput('{"s":"1a","k":5}'))
  assert.throws(() => parseInput('{"s":"12","k":0}'))
})

// Independent oracle: try every cut set and keep partitions whose pieces have no leading zero and are at most k.
function oracle(s, k) {
  const n = s.length
  let best = Infinity
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const cuts = [0]
    for (let i = 1; i < n; i++) if (mask & (1 << (i - 1))) cuts.push(i)
    cuts.push(n)
    const pieces = cuts.slice(1).map((end, idx) => s.slice(cuts[idx], end))
    if (pieces.every(p => p[0] !== '0' && Number(p) <= k)) best = Math.min(best, pieces.length)
  }
  return best === Infinity ? -1 : best
}

test('2522 random strings match the cut-set oracle', () => {
  let seed = 2522
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(9) + 1
    const s = Array.from({ length: n }, () => String(rnd(10))).join('')
    const k = rnd(200) + 1
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
