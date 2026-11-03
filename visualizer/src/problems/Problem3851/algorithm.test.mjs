import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (k, span, requests) => buildTrace({ k, span, requests }).result

test('3851 hand-checked presets', () => {
  assert.equal(solve(2, 5, [['ana', 1], ['ana', 3], ['ana', 4], ['ben', 2], ['ana', 9], ['ben', 3], ['ben', 4], ['ben', 5]]), 5)
  assert.equal(solve(1, 3, [['max', 0], ['max', 2], ['max', 4], ['max', 9], ['max', 10]]), 3)
})

test('3851 a single request is always kept when k is at least 1', () => {
  assert.equal(solve(1, 0, [['zed', 7]]), 1)
})

test('3851 identical times for one user respect the limit', () => {
  assert.equal(solve(2, 0, [['a', 5], ['a', 5], ['a', 5]]), 2)
})

test('3851 frames keep the status array aligned with the requests', () => {
  const run = buildTrace({ k: 1, span: 2, requests: [['q', 0], ['q', 1], ['q', 2]] })
  for (const frame of run.frames) assert.equal(frame.status.length, 3)
  assert.equal(run.frames.at(-1).total, run.result)
})

test('3851 rejects malformed requests', () => {
  assert.throws(() => parseInput('{"k":1,"span":1,"requests":[["A",1]]}'))
  assert.throws(() => parseInput('{"k":0,"span":1,"requests":[["a",1]]}'))
})

// Oracle: try every subset of requests and keep the largest feasible one.
function oracle(k, span, requests) {
  const n = requests.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const chosen = requests.filter((_, i) => mask & (1 << i))
    if (chosen.length <= best) continue
    let ok = true
    for (const [user, start] of chosen) {
      const count = chosen.filter(([u, s]) => u === user && s >= start && s <= start + span).length
      if (count > k) { ok = false; break }
    }
    if (ok) best = chosen.length
  }
  return best
}

test('3851 greedy matches a subset oracle on random small inputs', () => {
  let seed = 3851
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const k = 1 + rnd(3)
    const span = rnd(6)
    const requests = Array.from({ length: 1 + rnd(9) }, () => [['a', 'b'][rnd(2)], rnd(12)])
    assert.equal(solve(k, span, requests), oracle(k, span, requests), JSON.stringify({ k, span, requests }))
  }
})
