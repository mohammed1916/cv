import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (colors, edges) => buildTrace(parseInput(JSON.stringify({ colors, edges }))).result

// Independent oracle: root the tree at 0, collect each node's full descendant set, and test it directly.
function oracle(colors, edges) {
  const n = colors.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const parent = Array(n).fill(-2)
  parent[0] = -1
  const order = [0]
  for (let i = 0; i < order.length; i++) {
    for (const c of adj[order[i]]) if (parent[c] === -2) { parent[c] = order[i]; order.push(c) }
  }
  let best = 0
  for (let v = 0; v < n; v++) {
    const members = []
    for (let u = 0; u < n; u++) {
      let x = u
      while (x !== -1 && x !== v) x = parent[x]
      if (x === v) members.push(u)
    }
    if (members.every(u => colors[u] === colors[v])) best = Math.max(best, members.length)
  }
  return best
}

test('3004 worked presets', () => {
  assert.equal(solve([3, 3, 3, 3], [[0, 1], [1, 2], [1, 3]]), 4)
  assert.equal(solve([2, 2, 2, 1, 2, 2], [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]]), 2)
  assert.equal(solve([5], []), 1)
})

test('3004 a connected same-colour region that is not a subtree does not count', () => {
  // Nodes 1 and 2 share colour 1 and touch, but node 1 also has a child of colour 2.
  assert.equal(solve([9, 1, 1, 2], [[0, 1], [1, 2], [1, 3]]), 1)
})

test('3004 rejects malformed trees', () => {
  assert.throws(() => parseInput('{"colors":[1,1],"edges":[]}'))
  assert.throws(() => parseInput('{"colors":[1,1,1],"edges":[[0,1],[0,1]]}'))
  assert.throws(() => parseInput('{"colors":[1,1],"edges":[[0,0]]}'))
  assert.throws(() => parseInput('{"colors":[0],"edges":[]}'))
})

test('3004 matches the subtree oracle on random small trees', () => {
  let seed = 7
  const rand = k => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed % k
  }
  for (let trial = 0; trial < 300; trial++) {
    const n = 1 + rand(8)
    const colors = Array.from({ length: n }, () => 1 + rand(3))
    const edges = []
    for (let v = 1; v < n; v++) edges.push([rand(v), v])
    assert.equal(solve(colors, edges), oracle(colors, edges), JSON.stringify({ colors, edges }))
  }
})

test('3004 frames stay inside the pseudocode and python ranges', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace(parseInput('{"colors":[2,2,2,1,2,2],"edges":[[0,1],[0,2],[1,3],[1,4],[2,5]]}'))
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).best, run.result)
})
