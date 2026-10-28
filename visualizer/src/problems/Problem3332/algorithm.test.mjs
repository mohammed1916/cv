import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, k, stay_score, travel_score) => buildTrace({ n, k, stay_score, travel_score }).result

test('3332 official examples', () => {
  assert.equal(solve(2, 1, [[2, 3]], [[0, 2], [1, 0]]), 3)
  assert.equal(solve(3, 2, [[3, 4, 2], [2, 1, 2]], [[0, 2, 1], [2, 0, 4], [3, 2, 0]]), 8)
})

test('3332 a single day rewards the best stay', () => {
  assert.equal(solve(3, 1, [[5, 9, 1]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]), 9)
})

test('3332 rejects a travel score on the diagonal', () => {
  assert.throws(() => parseInput('{"n":2,"k":1,"stay_score":[[1,1]],"travel_score":[[1,2],[3,0]]}'))
})

// Independent oracle: try every sequence of cities (one per day boundary), scoring each day as a
// stay or a travel, and keep the best total.
function oracle(n, k, stay, travel) {
  let best = 0
  const walk = (day, pos, total) => {
    if (day === k) { best = Math.max(best, total); return }
    for (let next = 0; next < n; next++) {
      const gain = next === pos ? stay[day][pos] : travel[pos][next]
      walk(day + 1, next, total + gain)
    }
  }
  for (let start = 0; start < n; start++) walk(0, start, 0)
  return best
}

test('3332 random tours match an exhaustive oracle', () => {
  let seed = 3332
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(4)
    const k = 1 + rnd(4)
    const stay = Array.from({ length: k }, () => Array.from({ length: n }, () => rnd(21)))
    const travel = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : rnd(21))))
    assert.equal(solve(n, k, stay, travel), oracle(n, k, stay, travel), JSON.stringify({ n, k, stay, travel }))
  }
})
