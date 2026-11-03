import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (n, edges) => buildTrace({ n, edges }).result

// Independent oracle: Floyd-Warshall distances on the whole tree, and a subset counts as a subtree
// when it has exactly size-1 induced edges (a forest with that many edges is connected).
function oracle(n, edges) {
  const INF = 1e9
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)))
  for (const [u, v] of edges) { d[u - 1][v - 1] = 1; d[v - 1][u - 1] = 1 }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  const out = Array(n - 1).fill(0)
  for (let mask = 1; mask < 1 << n; mask++) {
    const members = [...Array(n).keys()].filter(i => (mask >> i) & 1)
    if (members.length < 2) continue
    const induced = edges.filter(([u, v]) => ((mask >> (u - 1)) & 1) && ((mask >> (v - 1)) & 1)).length
    if (induced !== members.length - 1) continue
    const diameter = Math.max(...members.flatMap(u => members.map(v => d[u][v])))
    out[diameter - 1]++
  }
  return out
}

test('1617 hand-made trees give the expected counts', () => {
  assert.deepEqual(solve(4, [[1, 2], [2, 3], [2, 4]]), [3, 4, 0])
  assert.deepEqual(solve(2, [[1, 2]]), [1])
  assert.deepEqual(solve(3, [[1, 2], [2, 3]]), [2, 1])
})

test('1617 random trees match the independent oracle', () => {
  let seed = 17
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 120; t++) {
    const n = 2 + rnd(7)
    const edges = []
    for (let v = 2; v <= n; v++) edges.push([1 + rnd(v - 1), v])
    const shuffled = edges.map(([u, v]) => (rnd(2) ? [u, v] : [v, u]))
    assert.deepEqual(solve(n, shuffled), oracle(n, shuffled), JSON.stringify({ n, edges }))
  }
})

test('1617 every frame has a phase, code line, narration and snapshot', () => {
  const run = buildTrace({ n: 4, edges: [[1, 2], [2, 3], [2, 4]] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 5)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.ok(python.includes('def count_subtrees'))
})

test('1617 rejects inputs that are not trees', () => {
  assert.throws(() => parseInput('{"n":1,"edges":[]}'), /2 to 10/)
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2]]}'), /exactly 2 pairs/)
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2],[2,1]]}'), /cycle/)
  assert.throws(() => parseInput('{"n":3,"edges":[[1,4],[2,3]]}'), /from 1 to n/)
  assert.throws(() => parseInput('{"n":3,"edges":[[2,2],[2,3]]}'), /itself/)
})
