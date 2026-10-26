import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges })))
function bfsAll(n, edges) {
  const g = Array.from({ length: n }, () => []); edges.forEach(([a, b]) => { g[a].push(b); g[b].push(a) })
  return Array.from({ length: n }, (_, s) => {
    const dist = new Array(n).fill(-1); dist[s] = 0; const q = [s]
    for (let h = 0; h < q.length; h++) for (const v of g[q[h]]) if (dist[v] < 0) { dist[v] = dist[q[h]] + 1; q.push(v) }
    return dist.reduce((x, y) => x + y, 0)
  })
}
test('official examples', () => {
  assert.deepEqual(solve(6, [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]]).result, [8, 12, 6, 10, 10, 10])
  assert.deepEqual(solve(1, []).result, [0]); assert.deepEqual(solve(2, [[1, 0]]).result, [1, 1])
})
test('random trees match BFS from every node', () => {
  let seed = 23; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12); const edges = []
    for (let v = 1; v < n; v++) edges.push(rnd(2) ? [rnd(v), v] : [v, rnd(v)])
    const run = solve(n, edges)
    assert.deepEqual(run.result, bfsAll(n, edges))
    assert.equal(run.frames[0].phase, 'start'); assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  for (const bad of ['null', '{"n":3,"edges":[[0,1]]}', '{"n":4,"edges":[[0,1],[0,1],[2,3]]}', '{"n":2,"edges":[[0,0]]}', '{"n":13,"edges":[]}', '{"n":2,"edges":[[0,5]]}']) assert.throws(() => parseInput(bad))
})
