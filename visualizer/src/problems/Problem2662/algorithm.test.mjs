import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (start, target, special_roads) => buildTrace(parseInput(JSON.stringify({ start, target, special_roads }))).result

test('2662 worked examples', () => {
  // Walk (1,1) to (1,2) for 1, road to (3,3) for 2, walk to (3,4) for 1, road to (4,5) for 1, walk to (5,5) for 1: total 6.
  assert.equal(solve([1, 1], [5, 5], [[1, 2, 3, 3, 2], [3, 4, 4, 5, 1]]), 6)
  assert.equal(solve([3, 2], [5, 7], [[3, 2, 3, 4, 4], [3, 3, 1, 0, 2], [4, 0, 0, 4, 4]]), 7)
})

test('2662 with no useful road the cost is the Manhattan distance', () => {
  assert.equal(solve([0, 0], [4, 3], [[10, 10, 0, 0, 30]]), 7)
})

test('2662 roads are one-way', () => {
  // Going backwards along the road costs the Manhattan walk, not the road price.
  assert.equal(solve([0, 0], [1, 0], [[5, 0, 0, 0, 1]]), 1)
})

test('2662 rejects a cost of zero', () => {
  assert.throws(() => parseInput('{"start":[0,0],"target":[1,1],"special_roads":[[0,0,1,1,0]]}'))
})

// Independent oracle: Floyd-Warshall over the same points, with Manhattan edges and road edges.
function oracle(start, target, roads) {
  const all = [start, target, ...roads.flatMap(r => [[r[0], r[1]], [r[2], r[3]]])]
  const unique = [...new Map(all.map(p => [`${p[0]},${p[1]}`, p])).values()]
  const idx = p => unique.findIndex(q => q[0] === p[0] && q[1] === p[1])
  const n = unique.length
  const d = unique.map((p, i) => unique.map((q, j) => (i === j ? 0 : Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]))))
  for (const [x1, y1, x2, y2, c] of roads) d[idx([x1, y1])][idx([x2, y2])] = Math.min(d[idx([x1, y1])][idx([x2, y2])], c)
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  return d[0][idx(target)]
}

test('2662 random instances match a Floyd-Warshall oracle', () => {
  let seed = 2662
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  const point = () => [rnd(11), rnd(11)]
  for (let t = 0; t < 250; t++) {
    const start = point(), target = point()
    const roads = Array.from({ length: 1 + rnd(5) }, () => [...point(), ...point(), 1 + rnd(30)].map((v, i) => v))
    const flat = roads.map(([a, b, c, d, cost]) => [a, b, c, d, cost])
    assert.equal(solve(start, target, flat), oracle(start, target, flat), JSON.stringify({ start, target, flat }))
  }
})
