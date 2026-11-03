import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: direct dynamic programming over every allowed previous index.
function oracle(values, maxStep) {
  const best = []
  for (let i = 0; i < values.length; i++) {
    if (i === 0) { best.push(values[0]); continue }
    let reachable = -Infinity
    for (let j = Math.max(0, i - maxStep); j < i; j++) reachable = Math.max(reachable, best[j])
    best.push(values[i] + reachable)
  }
  return best[values.length - 1]
}

function lcg(seed) {
  let state = seed
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state }
}

test('1696 random arrays with negative and positive values match the DP oracle', () => {
  const next = lcg(7)
  for (let trial = 0; trial < 2000; trial++) {
    const n = 1 + (next() % 15)
    const values = Array.from({ length: n }, () => (next() % 41) - 20)
    const maxStep = 1 + (next() % 6)
    const run = buildTrace({ values, maxStep })
    assert.equal(run.result, oracle(values, maxStep), JSON.stringify({ values, maxStep }))
    assert.equal(run.frames.at(-1).snapshot.result, run.result)
  }
})

test('1696 the candidate window never contains expired indices', () => {
  const values = [10, -5, 3, -2, 8, -7, 4, 1, -1, 6]
  for (const maxStep of [1, 2, 3, 5]) {
    const run = buildTrace({ values, maxStep })
    for (const frame of run.frames) {
      const { i, deque } = frame.snapshot
      for (const entry of deque) {
        if (frame.phase === 'start' || frame.phase === 'done') continue
        assert.ok(entry.index >= i - maxStep || frame.phase === 'expire', `${frame.phase} index ${entry.index} at ${i}`)
      }
      // Candidate scores are non-increasing from front to back.
      for (let k = 1; k < deque.length; k++) assert.ok(deque[k - 1].score > deque[k].score)
    }
    assert.equal(run.result, oracle(values, maxStep))
  }
})

test('1696 a single value returns itself and every phase is used', () => {
  assert.equal(buildTrace({ values: [-4], maxStep: 3 }).result, -4)
  const run = buildTrace({ values: [-4, 2, 1], maxStep: 1 })
  assert.equal(run.result, -1)
  const used = new Set(run.frames.map(frame => frame.phase))
  for (const phase of phases) assert.ok(used.has(phase.id), phase.id)
})

test('1696 invalid input is rejected', () => {
  for (const text of ['[1,2]', '{"values":[1],"maxStep":0}', '{"values":[],"maxStep":1}', '{"values":[1.5],"maxStep":1}', '{"values":[1],"maxStep":1.5}', '{"values":[20000],"maxStep":1}', 'oops']) {
    assert.throws(() => parseInput(text))
  }
  assert.deepEqual(parseInput('{"values":[1,-2],"maxStep":2}'), { values: [1, -2], maxStep: 2 })
})
