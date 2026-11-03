import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: the kept edges have all cycles even exactly when some 0/1 potential labels every edge as u xor v.
function consistent(n, kept) {
  for (let mask = 0; mask < 1 << n; mask++) {
    if (kept.every(([u, v, w]) => ((mask >> u) & 1) ^ ((mask >> v) & 1) === w)) return true
  }
  return false
}
function oracle(n, edges) {
  const kept = []
  let count = 0
  for (const e of edges) {
    if (consistent(n, [...kept, e])) { kept.push(e); count++ }
  }
  return count
}

test('3887 worked example', () => {
  assert.equal(buildTrace(parseInput('{"n":3,"edges":[[0,1,1],[1,2,1],[0,2,1]]}')).result, 2)
})

test('3887 an even triangle is accepted and an odd one is rejected', () => {
  assert.equal(buildTrace(parseInput('{"n":3,"edges":[[0,1,1],[1,2,0],[0,2,1]]}')).result, 3)
  assert.equal(buildTrace(parseInput('{"n":3,"edges":[[0,1,0],[1,2,0],[0,2,1]]}')).result, 2)
})

test('3887 matches the potential oracle on random small graphs', () => {
  for (let trial = 0; trial < 200; trial++) {
    const n = 2 + (trial % 5)
    const edges = []
    for (let i = 0; i < 6; i++) {
      const u = Math.floor(Math.random() * n)
      let v = Math.floor(Math.random() * n)
      if (v === u) v = (u + 1) % n
      edges.push([u, v, Math.random() < 0.5 ? 0 : 1])
    }
    assert.equal(buildTrace({ n, edges }).result, oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
