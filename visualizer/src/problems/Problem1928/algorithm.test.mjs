import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1928 hand-checked examples', () => {
  // Direct road 0 to 2 takes 3 and costs 1 + 1; the detour through city 1 takes 2 and costs 1 + 5 + 1.
  assert.equal(solve({ max_time: 3, edges: [[0, 1, 1], [1, 2, 1], [0, 2, 3]], passing_fees: [1, 5, 1] }), 2)
  assert.equal(solve({ max_time: 1, edges: [[0, 1, 2]], passing_fees: [1, 2] }), -1)
})

test('1928 the smallest graph reaches its last city directly', () => {
  assert.equal(solve({ max_time: 1, edges: [[0, 1, 1]], passing_fees: [1, 2] }), 3)
})

test('1928 rejects an edge that loops back to its own city', () => {
  assert.throws(() => parseInput('{"max_time":2,"edges":[[1,1,1]],"passing_fees":[1,2]}'))
})

// Independent oracle: depth-first search over every walk whose total time stays within max_time.
function oracle({ max_time: maxTime, edges, passing_fees: fees }) {
  const n = fees.length
  let best = Infinity
  const walk = (city, time, cost) => {
    if (city === n - 1) best = Math.min(best, cost)
    for (const [x, y, w] of edges) {
      for (const [u, v] of [[x, y], [y, x]]) {
        if (u === city && time + w <= maxTime) walk(v, time + w, cost + fees[v])
      }
    }
  }
  walk(0, 0, fees[0])
  return Number.isFinite(best) ? best : -1
}

test('1928 seeded random graphs match a walk enumeration', () => {
  let seed = 1928
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rnd(3)
    const edges = []
    for (let e = 0, count = 1 + rnd(5); e < count; e++) {
      const x = rnd(n)
      const y = rnd(n)
      if (x !== y) edges.push([x, y, 1 + rnd(4)])
    }
    if (edges.length === 0) edges.push([0, 1, 1])
    const input = { max_time: 1 + rnd(8), edges, passing_fees: Array.from({ length: n }, () => 1 + rnd(9)) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
