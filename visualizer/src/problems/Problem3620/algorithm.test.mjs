import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const allOn = n => Array(n).fill(true)
const solve = (edges, online, k) => buildTrace(parseInput(JSON.stringify({ edges, online, k }))).result

// Oracle: walk every route, independent of binary search and topological order.
function oracle(edges, online, k) {
  const n = online.length
  let best = -1
  const walk = (node, total, smallest) => {
    if (node === n - 1) {
      if (total <= k && smallest !== Infinity) best = Math.max(best, smallest)
      return
    }
    for (const [u, v, c] of edges) {
      if (u === node && online[v]) walk(v, total + c, Math.min(smallest, c))
    }
  }
  walk(0, 0, Infinity)
  return best
}

test('3620 hand-computed cases', () => {
  // Routes: 0-1-3-5 costs 19, too much; 0-2-3-5 costs 18 with minimum 4; 0-1-4-5 has minimum 2.
  assert.equal(solve([[0, 1, 8], [0, 2, 4], [1, 3, 6], [2, 3, 9], [1, 4, 2], [3, 5, 5], [4, 5, 7], [2, 4, 6]], allOn(6), 18), 4)
  // With a roomier budget, 0-1-3-5 becomes legal and its minimum 5 wins.
  assert.equal(solve([[0, 1, 8], [0, 2, 4], [1, 3, 6], [2, 3, 9], [1, 4, 2], [3, 5, 5], [4, 5, 7], [2, 4, 6]], allOn(6), 19), 5)
  // Node 1 is offline, so only the low route remains.
  assert.equal(solve([[0, 1, 9], [1, 3, 9], [0, 2, 3], [2, 3, 5]], [true, false, true, true], 20), 3)
})

test('3620 edge cases', () => {
  assert.equal(solve([[0, 1, 6], [1, 2, 6]], allOn(3), 5), -1)
  assert.equal(solve([], allOn(2), 7), -1)
  assert.equal(solve([[0, 1, 0]], allOn(2), 0), 0, 'a zero-cost edge scores 0, which differs from no route')
  assert.equal(solve([[1, 0, 4]], allOn(2), 9), -1, 'an edge pointing the wrong way gives no route')
  assert.equal(solve([[0, 1, 3], [1, 2, 3]], [true, false, true], 100), -1, 'the only route passes through an offline node')
  assert.equal(solve([[0, 1, 3], [0, 1, 9]], allOn(2), 9), 9, 'parallel edges compete')
  assert.equal(solve([[0, 1, 1000000000]], allOn(2), 50000000000000), 1000000000)
})

test('3620 parseInput rejects bad input', () => {
  const bad = obj => assert.throws(() => parseInput(JSON.stringify(obj)))
  bad({ edges: [[0, 1, 1], [1, 0, 1]], online: allOn(2), k: 1 })
  bad({ edges: [], online: [false, true], k: 1 })
  bad({ edges: [], online: [true, false], k: 1 })
  bad({ edges: [[0, 0, 1]], online: allOn(2), k: 1 })
  bad({ edges: [[0, 5, 1]], online: allOn(2), k: 1 })
  bad({ edges: [[0, 1, -1]], online: allOn(2), k: 1 })
  bad({ edges: [], online: [true], k: 1 })
  bad({ edges: [], online: allOn(2), k: -1 })
  bad({ edges: [], online: allOn(11), k: 1 })
})

function randomCase(rnd) {
  const n = 2 + rnd(7)
  const edges = []
  for (let u = 0; u < n; u++) {
    for (let v = u + 1; v < n; v++) if (rnd(3) === 0 && edges.length < 20) edges.push([u, v, rnd(10)])
  }
  // Shuffle node numbers so numeric order is not already topological, keeping the endpoints fixed.
  const inner = Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 1)
  for (let i = inner.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [inner[i], inner[j]] = [inner[j], inner[i]]
  }
  const rename = [0, ...inner, n - 1]
  const named = edges.map(([u, v, c]) => [rename[u], rename[v], c])
  const online = Array.from({ length: n }, (_, node) => node === 0 || node === n - 1 || rnd(4) !== 0)
  return { edges: named, online, k: rnd(30) }
}

test('3620 random DAGs match route enumeration', () => {
  let seed = 3620
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let run = 0; run < 2000; run++) {
    const { edges, online, k } = randomCase(rnd)
    assert.equal(solve(edges, online, k), oracle(edges, online, k), JSON.stringify({ edges, online, k }))
  }
})

test('3620 frames are well formed and honest', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const pyCount = python.split('\n').length
  let seed = 19
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let run = 0; run < 200; run++) {
    const { edges, online, k } = randomCase(rnd)
    const trace = buildTrace({ edges, online, k })
    const last = trace.frames.at(-1)
    assert.equal(last.phase, 'done')
    assert.equal(last.best, trace.result)
    for (const frame of trace.frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
      assert.ok(frame.message.length > 0)
      assert.equal(frame.roles.length, edges.length)
    }
    // Each recorded route must stay inside the budget, and its edges must meet the floor.
    for (const frame of trace.frames.filter(item => item.phase === 'narrow' && item.probes.at(-1).verdict === 'works')) {
      const path = edges.filter((_, index) => frame.roles[index] === 'path')
      assert.equal(path.reduce((sum, edge) => sum + edge[2], 0), frame.sinkCost)
      assert.ok(frame.sinkCost <= k)
      assert.ok(path.every(edge => edge[2] >= frame.floor))
    }
  }
})

test('3620 the ladder narrows monotonically', () => {
  const trace = buildTrace(parseInput('{"edges":[[0,1,8],[0,2,4],[1,3,6],[2,3,9],[1,4,2],[3,5,5],[4,5,7],[2,4,6]],"online":[true,true,true,true,true,true],"k":18}'))
  const probes = trace.frames.filter(frame => frame.phase === 'narrow')
  assert.ok(probes.length >= 2)
  let width = Infinity
  for (const frame of probes) {
    const current = frame.hi - frame.lo
    assert.ok(current < width)
    width = current
  }
})
