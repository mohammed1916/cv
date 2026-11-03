import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python, phases } from './algorithm.js'

const CODE_LINES = new Map(code.map(entry => [entry.line, entry.text]))
const PYTHON_LINES = python.split('\n')
const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrameInvariants(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase}`)
    assert.ok(CODE_LINES.get(frame.activeLine)?.trim(), `pseudocode line ${frame.activeLine}`)
    assert.ok(PYTHON_LINES[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine}`)
  }
}

// Independent oracle: BFS from every node and take the largest distance.
function oracle(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  let best = 0
  for (let s = 0; s < n; s += 1) {
    const dist = Array(n).fill(-1)
    dist[s] = 0
    const queue = [s]
    while (queue.length) {
      const v = queue.shift()
      for (const w of adj[v]) if (dist[w] === -1) { dist[w] = dist[v] + 1; queue.push(w) }
    }
    best = Math.max(best, ...dist)
  }
  return best
}

test('the five-node example has diameter 3 (for example 0-1-2-4)', () => {
  const run = buildTrace(parseInput('{"n":5,"edges":[[0,1],[1,2],[1,3],[2,4]]}'))
  assert.equal(run.result, 3)
  assertFrameInvariants(run)
})

test('a path of four nodes has diameter 3', () => {
  assert.equal(buildTrace(parseInput('{"n":4,"edges":[[0,1],[1,2],[2,3]]}')).result, 3)
})

test('a single node has diameter 0', () => {
  assert.equal(buildTrace(parseInput('{"n":1,"edges":[]}')).result, 0)
})

test('a star has diameter 2 whatever the centre is', () => {
  assert.equal(buildTrace(parseInput('{"n":5,"edges":[[4,0],[4,1],[4,2],[4,3]]}')).result, 2)
})

test('parseInput rejects non-trees', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1]]}'), /exactly n - 1/)
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[0,1]]}'), /connect every node/)
  assert.throws(() => parseInput('{"n":3,"edges":[[0,3],[0,1]]}'), /from 0 to n - 1/)
  assert.throws(() => parseInput('{"n":16,"edges":[]}'), /from 1 to 15/)
})

test('the trace agrees with the all-pairs oracle on random trees', () => {
  let seed = 1245
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed
  }
  for (let trial = 0; trial < 300; trial += 1) {
    const n = 1 + (next() % 12)
    const edges = []
    for (let v = 1; v < n; v += 1) {
      const parent = next() % v
      edges.push(next() % 2 ? [parent, v] : [v, parent])
    }
    const text = JSON.stringify({ n, edges })
    const run = buildTrace(parseInput(text))
    assert.equal(run.result, oracle(n, edges), text)
    assertFrameInvariants(run)
  }
})
