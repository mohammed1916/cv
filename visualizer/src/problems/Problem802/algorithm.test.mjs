import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text))
function oracle(graph) {
  const color = new Array(graph.length).fill(0) // 1 visiting, 2 safe, 3 unsafe
  const dfs = u => {
    if (color[u]) return color[u] === 2
    color[u] = 1
    for (const v of graph[u]) if (!dfs(v)) { color[u] = 3; return false }
    color[u] = 2
    return true
  }
  return graph.map((_, i) => i).filter(dfs)
}
test('official examples', () => {
  assert.deepEqual(solve('[[1,2],[2,3],[5],[0],[5],[],[]]').result, [2, 4, 5, 6])
  assert.deepEqual(solve('[[1,2,3,4],[1,2],[3,4],[0,4],[]]').result, [4])
})
test('random graphs match DFS colouring', () => {
  let seed = 7
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(9)
    const g = Array.from({ length: n }, () => [...new Set(Array.from({ length: rnd(3) }, () => rnd(n)))])
    const r = buildTrace(g)
    assert.deepEqual(r.result, oracle(g))
    assert.equal(r.frames[0].phase, 'start')
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('[[5]]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[[0,0]]'))
})
