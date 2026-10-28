import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('1416 hand-checked examples', () => {
  // The only split is the whole string 1000, which is at most 10000.
  assert.equal(solve('1000', 10000), 1)
  // No piece can be 1000 or less than 10 without a leading zero, so no split works.
  assert.equal(solve('1000', 10), 0)
  assert.equal(solve('1317', 2000), 8)
})

test('1416 rejects non-digit strings and k out of range', () => {
  assert.throws(() => parseInput('{"s":"12a","k":5}'))
  assert.throws(() => parseInput('{"s":"12","k":0}'))
})

// Independent oracle: try every cut set and keep splits whose pieces have no leading zero and are at most k.
function oracle(s, k) {
  const n = s.length
  let count = 0
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const cuts = [0]
    for (let i = 1; i < n; i++) if (mask & (1 << (i - 1))) cuts.push(i)
    cuts.push(n)
    const pieces = cuts.slice(1).map((end, idx) => s.slice(cuts[idx], end))
    if (pieces.every(p => p[0] !== '0' && Number(p) <= k)) count++
  }
  return count
}

test('1416 random strings match the cut-set oracle', () => {
  let seed = 1416
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(9) + 1
    const s = Array.from({ length: n }, () => String(rnd(10))).join('')
    const k = rnd(500) + 1
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
