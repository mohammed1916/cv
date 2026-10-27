import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = cost => buildTrace(parseInput(JSON.stringify({ cost }))).result

test('1595 official example', () => {
  assert.equal(solve([[15, 96], [36, 2]]), 17)
  assert.equal(solve([[7]]), 7)
})

test('1595 the cheapest edge into an uncovered point is still paid', () => {
  // The single first-group point must reach both second-group points; its cheap edge to point 0 is 1 and to point 1 is 9.
  assert.equal(solve([[1, 9]]), 10)
})

test('1595 rejects bad input', () => {
  assert.throws(() => parseInput('{"cost":[[1,2],[3]]}'))
  assert.throws(() => parseInput('{"cost":[[101]]}'))
  assert.throws(() => parseInput('{"cost":[]}'))
})

// Independent oracle: choose every subset of edges, keep subsets that touch every point on both sides.
function oracle(cost) {
  const m = cost.length
  const n = cost[0].length
  const edges = []
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) edges.push([i, j, cost[i][j]])
  let best = Infinity
  for (let s = 1; s < 1 << edges.length; s++) {
    const leftHit = new Set()
    const rightHit = new Set()
    let total = 0
    edges.forEach(([i, j, c], e) => {
      if (s & (1 << e)) { leftHit.add(i); rightHit.add(j); total += c }
    })
    if (leftHit.size === m && rightHit.size === n) best = Math.min(best, total)
  }
  return best
}

test('1595 random matrices match the edge-subset oracle', () => {
  let seed = 1595
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(3)
    const cost = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(11)))
    assert.equal(solve(cost), oracle(cost), JSON.stringify(cost))
  }
})
