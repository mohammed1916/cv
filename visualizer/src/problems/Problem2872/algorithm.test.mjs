import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: try every set of cut edges and keep the largest split where every part is divisible by k.
function oracle({ n, edges, values, k }) {
  let best = -1
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    const owner = Array.from({ length: n }, (_, i) => i)
    const find = x => (owner[x] === x ? x : find(owner[x]))
    edges.forEach(([a, b], i) => { if (!(mask & (1 << i))) owner[find(a)] = find(b) })
    const sums = new Map()
    for (let v = 0; v < n; v++) sums.set(find(v), (sums.get(find(v)) ?? 0) + values[v])
    if ([...sums.values()].every(s => s % k === 0)) best = Math.max(best, sums.size)
  }
  return best
}

test('2872 two and three node examples', () => {
  assert.equal(solve({ n: 2, edges: [[0, 1]], values: [3, 3], k: 3 }), 2)
  assert.equal(solve({ n: 3, edges: [[0, 1], [1, 2]], values: [1, 2, 3], k: 3 }), 2)
})

test('2872 with k equal to 1 every node is its own component', () => {
  assert.equal(solve({ n: 4, edges: [[0, 1], [1, 2], [1, 3]], values: [1, 2, 3, 4], k: 1 }), 4)
})

test('2872 rejects a total that k does not divide', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1]],"values":[1,1],"k":3}'))
})

test('2872 random trees match an all-cuts oracle', () => {
  let seed = 2872
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(8)
    const edges = []
    for (let i = 1; i < n; i++) {
      const parent = rnd(i)
      edges.push(rnd(2) ? [parent, i] : [i, parent])
    }
    const values = Array.from({ length: n }, () => rnd(10))
    const k = 1 + rnd(4)
    const total = values.reduce((a, b) => a + b, 0)
    if (total % k !== 0) values[0] += k - (total % k)
    const input = { n, edges, values, k }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
