import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (prize_positions, k) => buildTrace(parseInput(JSON.stringify({ prize_positions, k }))).result

test('2555 official examples', () => {
  assert.equal(solve([1, 1, 2, 2, 3, 3, 5], 2), 7)
  assert.equal(solve([1, 2, 3, 4], 0), 2)
})

test('2555 the two segments may overlap and still count each prize once', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 6], 3), 6)
})

test('2555 rejects unsorted prizes', () => {
  assert.throws(() => parseInput('{"prize_positions":[2,1],"k":1}'))
})

// Independent oracle: try every pair of starting points from 0 to 50 and count the prizes either segment covers.
function oracle(pos, k) {
  let best = 0
  for (let x1 = 0; x1 <= 50; x1++) {
    for (let x2 = 0; x2 <= 50; x2++) {
      const count = pos.filter(p => (x1 <= p && p <= x1 + k) || (x2 <= p && p <= x2 + k)).length
      best = Math.max(best, count)
    }
  }
  return best
}

test('2555 random prizes match a pairs-of-segments oracle', () => {
  let seed = 2555
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(12)
    const pos = Array.from({ length: len }, () => rnd(31)).sort((a, b) => a - b)
    const k = rnd(8)
    assert.equal(solve(pos, k), oracle(pos, k), JSON.stringify({ pos, k }))
  }
})
