import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: for each center, try every subset of its incident edges of size at most k.
function oracle({ vals, edges, k }) {
  let best = -Infinity
  vals.forEach((center, c) => {
    const inc = edges.filter(([u, v]) => u === c || v === c).map(([u, v]) => (u === c ? v : u))
    for (let mask = 0; mask < 1 << inc.length; mask++) {
      let count = 0
      let total = center
      for (let t = 0; t < inc.length; t++) {
        if (mask & (1 << t)) { count++; total += vals[inc[t]] }
      }
      if (count <= k && total > best) best = total
    }
  })
  return best
}

test('2497 examples', () => {
  assert.equal(solve({ vals: [1, 2, 3, 4, 10, -10, -20], edges: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [3, 6]], k: 2 }), 16)
  assert.equal(solve({ vals: [-5], edges: [], k: 0 }), -5)
})

test('2497 rejects a duplicate edge', () => {
  assert.throws(() => parseInput('{"vals":[1,2],"edges":[[0,1],[1,0]],"k":1}'))
})

test('2497 random graphs match an edge-subset oracle', () => {
  let seed = 2497
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const vals = Array.from({ length: n }, () => rnd(21) - 10)
    const all = []
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) all.push([u, v])
    const edges = all.filter(() => rnd(2) === 1)
    const k = rnd(4)
    const input = { vals, edges, k }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
