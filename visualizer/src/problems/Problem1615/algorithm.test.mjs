import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent reference: roads touching a or b, each road counted once.
function reference(n, roads) {
  let best = 0
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const touching = roads.filter(([x, y]) => x === a || x === b || y === a || y === b).length
      best = Math.max(best, touching)
    }
  }
  return best
}

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 10)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `code line ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length, `python line ${f.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('sample with a hub city gives rank 5 through a shared road', () => {
  const run = buildTrace(parseInput('{"n":5,"roads":[[0,2],[1,2],[2,3],[2,4],[3,4]]}'))
  assert.equal(run.result, 5)
  assertFrames(run)
})

test('chain, disjoint roads and no roads', () => {
  assert.equal(buildTrace({ n: 3, roads: [[0, 1], [1, 2]] }).result, 2)
  assert.equal(buildTrace({ n: 4, roads: [[0, 1], [2, 3]] }).result, 2)
  assert.equal(buildTrace({ n: 3, roads: [] }).result, 0)
})

test('random graphs agree with the reference', () => {
  let seed = 21
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rand(7)
    const all = []
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) all.push([a, b])
    const roads = all.filter(() => rand(2) === 0).map(([a, b]) => (rand(2) ? [a, b] : [b, a]))
    const run = buildTrace({ n, roads })
    assert.equal(run.result, reference(n, roads), JSON.stringify({ n, roads }))
    assertFrames(run)
  }
})

test('duplicate roads and self loops are rejected', () => {
  assert.throws(() => parseInput('{"n":3,"roads":[[0,1],[1,0]]}'), /one road/)
  assert.throws(() => parseInput('{"n":3,"roads":[[1,1]]}'), /different/)
})
