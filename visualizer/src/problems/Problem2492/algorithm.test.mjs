import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (n, roads) => buildTrace(parseInput(JSON.stringify({ n, roads }))).result
const PY = python.split('\n')

test('2492 worked examples', () => {
  assert.equal(solve(4, [[1, 2, 9], [2, 3, 6], [2, 4, 5], [1, 4, 7]]), 5)
  assert.equal(solve(4, [[1, 2, 2], [1, 3, 1], [3, 4, 1]]), 1)
})

test('2492 frames point at real python lines', () => {
  for (const f of buildTrace({ n: 3, roads: [[1, 2, 4], [2, 3, 2]] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2492 rejects disconnected cities', () => {
  assert.throws(() => parseInput('{"n":3,"roads":[[1,2,4]]}'))
})

// Oracle: a road can be walked back and forth, so the answer is the lightest road that shares a component with city 1.
function oracle(n, roads) {
  const parent = Array.from({ length: n + 1 }, (_, i) => i)
  const find = x => (parent[x] === x ? x : find(parent[x]))
  for (const [a, b] of roads) parent[find(a)] = find(b)
  return Math.min(...roads.filter(([a]) => find(a) === find(1)).map(r => r[2]))
}

test('2492 random connected graphs match an oracle', () => {
  let seed = 2492
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const roads = []
    for (let v = 2; v <= n; v++) roads.push([1 + rnd(v - 1), v, 1 + rnd(50)])
    for (let e = rnd(4); e > 0; e--) { const a = 1 + rnd(n), b = 1 + rnd(n); if (a !== b) roads.push([a, b, 1 + rnd(50)]) }
    assert.equal(solve(n, roads), oracle(n, roads), JSON.stringify({ n, roads }))
  }
})
