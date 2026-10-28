import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('2767 hand-checked examples', () => {
  // "101" is 5 and "1" is 1.
  assert.equal(solve('1011'), 2)
  // Each "1" is 1, a power of 5 on its own.
  assert.equal(solve('111'), 3)
  // Only zeros: no beautiful substring exists.
  assert.equal(solve('0'), -1)
})

test('2767 rejects characters other than 0 and 1', () => {
  assert.throws(() => parseInput('{"s":"102"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

// Independent oracle: try every cut set; a piece is beautiful when it has no leading zero and is a power of 5.
function isBeautiful(piece) {
  if (piece[0] === '0') return false
  let v = parseInt(piece, 2)
  if (v === 0) return false
  while (v % 5 === 0) v /= 5
  return v === 1
}

function oracle(s) {
  const n = s.length
  let best = Infinity
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const cuts = [0]
    for (let i = 1; i < n; i++) if (mask & (1 << (i - 1))) cuts.push(i)
    cuts.push(n)
    const pieces = cuts.slice(1).map((end, idx) => s.slice(cuts[idx], end))
    if (pieces.every(isBeautiful)) best = Math.min(best, pieces.length)
  }
  return best === Infinity ? -1 : best
}

test('2767 random strings match the cut-set oracle', () => {
  let seed = 2767
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(12) + 1
    const s = Array.from({ length: n }, () => (rnd(3) === 0 ? '0' : '1')).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
