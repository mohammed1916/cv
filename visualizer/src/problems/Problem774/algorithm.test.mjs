import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (stations, k) => buildTrace({ stations, k }).result

test('774 official examples', () => {
  assert.ok(Math.abs(solve([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 9) - 0.5) < 1e-6)
  assert.ok(Math.abs(solve([23, 24, 36, 39, 46, 56, 57, 65, 84, 98], 1) - 14) < 1e-6)
})

test('774 rejects unsorted stations', () => {
  assert.throws(() => parseInput('{"stations":[3,1],"k":1}'))
})

// Independent oracle, exact in integers: the best largest gap is some G/m, where G is a gap and m a
// number of parts. Check each candidate G/m with ceil(g * m / G) - 1 stations per gap, in integer arithmetic.
function oracle(stations, k) {
  const gaps = stations.slice(1).map((x, i) => x - stations[i])
  let best = Infinity
  for (const G of gaps) {
    for (let m = 1; m <= k + 1; m++) {
      const stationsNeeded = gaps.reduce((total, g) => total + Math.floor((g * m + G - 1) / G) - 1, 0)
      if (stationsNeeded <= k) best = Math.min(best, G / m)
    }
  }
  return best
}

test('774 random inputs match the exact oracle', () => {
  let seed = 7
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const pool = Array.from({ length: 60 }, (_, i) => i)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const stations = pool.slice(0, 2 + rnd(8)).sort((a, b) => a - b)
    const k = 1 + rnd(8)
    assert.ok(Math.abs(solve(stations, k) - oracle(stations, k)) < 1e-6, JSON.stringify({ stations, k }))
  }
})
