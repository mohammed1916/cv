import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (points, target) => buildTrace({ points, target }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
  }
  assert.ok(['found', 'stop'].includes(run.frames.at(-1).phase))
}

test('3923 hand-checked cases', () => {
  assert.equal(solve([[0, 0, 0], [6, 6, 6]], [3, 3, 3]), 1)
  assert.equal(solve([[0, 0, 0], [6, 0, 0]], [1, 0, 0]), 2)
  assert.equal(solve([[1, 2, 3]], [1, 2, 3]), 0)
  assert.equal(solve([[0, 0, 0]], [1, 0, 0]), -1)
})

test('3923 frames are complete for the presets', () => {
  assertFrames(buildTrace({ points: [[0, 0, 0], [6, 0, 0]], target: [1, 0, 0] }))
  assertFrames(buildTrace({ points: [[0, 0, 0]], target: [1, 0, 0] }))
})

test('3923 rejects bad input', () => {
  assert.throws(() => parseInput('{"points":[[0,0,0],[0,0,0]],"target":[1,1,1]}'))
  assert.throws(() => parseInput('{"points":[[0,0,7]],"target":[1,1,1]}'))
  assert.throws(() => parseInput('{"points":[[0,0]],"target":[1,1,1]}'))
})

// Oracle: independent generation-by-generation search over a Set, with pairs chosen by index.
function oracle(points, target) {
  const goal = target.join()
  let known = new Set(points.map(p => p.join()))
  if (known.has(goal)) return 0
  for (let g = 1; g <= 400; g++) {
    const list = [...known].map(s => s.split(',').map(Number))
    const next = new Set()
    for (let a = 0; a < list.length; a++) {
      for (let b = 0; b < list.length; b++) {
        if (a === b) continue
        next.add(list[a].map((v, i) => Math.floor((v + list[b][i]) / 2)).join())
      }
    }
    if (next.has(goal)) return g
    const grown = new Set([...known, ...next])
    if (grown.size === known.size) return -1
    known = grown
  }
  return -1
}

test('3923 random small inputs match the oracle', () => {
  let seed = 3923
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const seen = new Set()
    const points = []
    const count = 1 + rnd(4)
    while (points.length < count) {
      const p = [rnd(7), rnd(7), rnd(7)]
      if (!seen.has(p.join())) { seen.add(p.join()); points.push(p) }
    }
    const target = [rnd(7), rnd(7), rnd(7)]
    assert.equal(solve(points, target), oracle(points, target), JSON.stringify({ points, target }))
  }
})
