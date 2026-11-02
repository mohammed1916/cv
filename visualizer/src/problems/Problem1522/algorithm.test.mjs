import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = children => buildTrace({ children }).result

function checkFrames(trace) {
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

test('1522 worked examples', () => {
  const children = [[1, 2, 3], [4, 5], [], [6], [], [], [7], []]
  assert.equal(solve(children), 5)
  assert.equal(solve([[]]), 0)
  assert.equal(solve([[1], [2], []]), 2)
  checkFrames(buildTrace({ children }))
})

test('1522 the path need not pass through the root', () => {
  // Root 0 -> 1; node 1 has children 2 and 3; node 2 -> 4 -> 5. The path 5-4-2-1-3 (4 edges) avoids the root.
  assert.equal(solve([[1], [2, 3], [4], [], [5], []]), 4)
})

// Oracle: all-pairs BFS over the undirected tree, then the largest distance.
function oracle(children) {
  const n = children.length
  const adj = Array.from({ length: n }, () => [])
  children.forEach((kids, v) => kids.forEach(c => { adj[v].push(c); adj[c].push(v) }))
  let best = 0
  for (let s = 0; s < n; s++) {
    const dist = Array(n).fill(-1)
    dist[s] = 0
    const queue = [s]
    for (let q = 0; q < queue.length; q++) {
      const v = queue[q]
      for (const u of adj[v]) if (dist[u] === -1) { dist[u] = dist[v] + 1; queue.push(u) }
    }
    best = Math.max(best, ...dist)
  }
  return best
}

test('1522 random trees match an all-pairs BFS oracle', () => {
  let seed = 1522
  const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 16) % k }
  for (let trial = 0; trial < 300; trial++) {
    const n = 1 + rand(12)
    const children = Array.from({ length: n }, () => [])
    for (let v = 1; v < n; v++) children[rand(v)].push(v)
    assert.equal(solve(children), oracle(children), JSON.stringify(children))
  }
})

test('1522 rejects a graph that is not a rooted tree', () => {
  assert.throws(() => parseInput('{"children":[[1],[0]]}'))
  assert.throws(() => parseInput('{"children":[[1],[],[]]}'))
})
