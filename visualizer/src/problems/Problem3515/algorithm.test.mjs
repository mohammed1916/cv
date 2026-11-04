import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (n, edges, queries) => buildTrace({ n, edges, queries }).result

test('3515 hand-computed cases', () => {
  // 1-2 (3), 1-3 (5), 2-4 (2), 2-5 (6), 3-6 (1).
  assert.deepEqual(solve(6, [[1, 2, 3], [1, 3, 5], [2, 4, 2], [2, 5, 6], [3, 6, 1]],
    [[2, 5], [1, 1, 2, 8], [2, 5], [2, 4], [1, 6, 3, 4], [2, 6], [2, 1]]), [9, 14, 10, 9, 0])
  // Chain 1-2-3-4-5 with weights 4, 7, 1, 2, and the edge named child end first.
  assert.deepEqual(solve(5, [[5, 4, 2], [3, 2, 7], [4, 3, 1], [1, 2, 4]], [[2, 5], [1, 3, 4, 9], [2, 5], [2, 3]]), [14, 22, 11])
  assert.deepEqual(solve(1, [], [[2, 1]]), [0])
  assert.deepEqual(solve(2, [[2, 1, 9]], [[1, 1, 2, 9]]), [])
})

// Independent oracle: walk parent links with the current weights, no Fenwick tree involved.
function oracle(n, edges, queries) {
  const adjacent = Array.from({ length: n + 1 }, () => [])
  for (const [u, v] of edges) { adjacent[u].push(v); adjacent[v].push(u) }
  const parent = new Array(n + 1).fill(0)
  const pending = [1]
  while (pending.length) {
    const node = pending.pop()
    for (const next of adjacent[node]) if (next !== parent[node]) { parent[next] = node; pending.push(next) }
  }
  const weights = new Map()
  const key = (u, v) => `${Math.min(u, v)},${Math.max(u, v)}`
  for (const [u, v, w] of edges) weights.set(key(u, v), w)
  const out = []
  for (const query of queries) {
    if (query[0] === 1) weights.set(key(query[1], query[2]), query[3])
    else {
      let total = 0
      for (let x = query[1]; x !== 1; x = parent[x]) total += weights.get(key(x, parent[x]))
      out.push(total)
    }
  }
  return out
}

function randomCase(rnd) {
  const n = 1 + rnd(15)
  const labels = Array.from({ length: n - 1 }, (_, i) => i + 2)
  for (let i = labels.length - 1; i > 0; i--) { const j = rnd(i + 1); [labels[i], labels[j]] = [labels[j], labels[i]] }
  const placed = [1]
  const edges = []
  for (const label of labels) {
    const other = placed[rnd(placed.length)]
    edges.push(rnd(2) ? [other, label, 1 + rnd(50)] : [label, other, 1 + rnd(50)])
    placed.push(label)
  }
  const queries = Array.from({ length: 1 + rnd(12) }, () => {
    if (edges.length && rnd(2)) {
      const [u, v] = edges[rnd(edges.length)]
      return rnd(2) ? [1, u, v, 1 + rnd(50)] : [1, v, u, 1 + rnd(50)]
    }
    return [2, 1 + rnd(n)]
  })
  return { n, edges, queries }
}

const random = seedStart => { let seed = seedStart; return n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n } }

test('3515 random trees match the path-walking oracle', () => {
  const rnd = random(3515)
  for (let t = 0; t < 400; t++) {
    const { n, edges, queries } = randomCase(rnd)
    assert.deepEqual(solve(n, edges, queries), oracle(n, edges, queries), JSON.stringify({ n, edges, queries }))
  }
})

test('3515 every subtree is one contiguous run of positions', () => {
  const rnd = random(77)
  for (let t = 0; t < 100; t++) {
    const { n, edges, queries } = randomCase(rnd)
    const { frames } = buildTrace({ n, edges, queries })
    const last = frames.at(-1)
    const inside = node => { for (let x = node; x; x = last.parent[x]) { if (x === inside.root) return true } return false }
    for (let root = 1; root <= n; root++) {
      inside.root = root
      const positions = []
      for (let node = 1; node <= n; node++) if (inside(node)) positions.push(last.tin[node])
      positions.sort((a, b) => a - b)
      assert.equal(positions.length, last.size[root])
      assert.equal(positions[0], last.tin[root])
      assert.equal(positions.at(-1), last.tin[root] + last.size[root] - 1)
    }
  }
})

test('3515 frames show true distances after each completed step', () => {
  const edges = [[1, 2, 3], [1, 3, 5], [2, 4, 2], [2, 5, 6], [3, 6, 1]]
  const queries = [[2, 5], [1, 1, 2, 8], [2, 5]]
  const { frames, result } = buildTrace({ n: 6, edges, queries })
  const lines = python.trim().split('\n').length
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1 && f.pythonLine <= lines)
    assert.ok(f.message.length > 0)
    assert.equal(f.tree.length, 6)
  }
  const last = frames.at(-1)
  assert.equal(last.phase, 'done')
  assert.deepEqual(last.answers, result)
  const distAt = node => last.dist[last.tin[node] - 1]
  assert.equal(distAt(1), 0)
  assert.equal(distAt(5), 14)
  assert.equal(distAt(3), 5)
  assert.equal(distAt(6), 6)
  assert.equal(frames.filter(f => f.phase === 'load').length, 10)
  const answered = frames.filter(f => f.ops[0]?.type === 'query')
  assert.deepEqual(answered.map(f => f.ops[0].total), [9, 14])
  for (const f of frames.filter(f => f.ops[0]?.type === 'update')) assert.ok(f.range && f.focus)
})

test('3515 parseInput rejects bad shapes', () => {
  const ok = '{"n":2,"edges":[[1,2,3]],"queries":[[2,2]]}'
  assert.equal(parseInput(ok).n, 2)
  for (const bad of [
    '{"n":3,"edges":[[1,2,3],[1,2,4]],"queries":[[2,2]]}',
    '{"n":2,"edges":[],"queries":[[2,2]]}',
    '{"n":2,"edges":[[1,2,0]],"queries":[[2,2]]}',
    '{"n":3,"edges":[[1,2,3],[2,3,4]],"queries":[[1,1,3,5]]}',
    '{"n":2,"edges":[[1,2,3]],"queries":[]}',
    '{"n":2,"edges":[[1,2,3]],"queries":[[2,9]]}',
    '{"n":2,"edges":[[1,2,3]],"queries":[[3,1]]}',
  ]) assert.throws(() => parseInput(bad), bad)
})
