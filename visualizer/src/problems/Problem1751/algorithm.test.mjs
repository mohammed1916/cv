import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1751 official examples', () => {
  assert.equal(solve({ events: [[1, 2, 4], [3, 4, 3], [2, 3, 1]], k: 2 }), 7)
  assert.equal(solve({ events: [[1, 2, 4], [3, 4, 3], [2, 3, 10]], k: 2 }), 10)
  assert.equal(solve({ events: [[1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]], k: 3 }), 9)
})

test('1751 an event that touches another on the same day cannot be added', () => {
  // Day 2 is the end of the first event and the start of the second, so both cannot be attended.
  assert.equal(solve({ events: [[1, 2, 5], [2, 3, 5]], k: 2 }), 5)
})

test('1751 rejects an out-of-range day and k above 4', () => {
  assert.throws(() => parseInput('{"events":[[3,2,1]],"k":1}'))
  assert.throws(() => parseInput('{"events":[[1,2,1]],"k":5}'))
})

// Independent oracle: try every subset of at most k events and keep the best one with no overlaps.
function oracle({ events, k }) {
  const n = events.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const chosen = events.filter((_, i) => (mask >> i) & 1)
    if (chosen.length > k) continue
    chosen.sort((a, b) => a[0] - b[0])
    let ok = true
    for (let i = 1; i < chosen.length; i++) if (chosen[i][0] <= chosen[i - 1][1]) ok = false
    if (ok) best = Math.max(best, chosen.reduce((sum, e) => sum + e[2], 0))
  }
  return best
}

test('1751 random inputs match a subset oracle', () => {
  let seed = 1751
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const events = Array.from({ length: 1 + rnd(6) }, () => {
      const start = 1 + rnd(10)
      return [start, start + rnd(4), 1 + rnd(10)]
    })
    const input = { events, k: 1 + rnd(3) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
