import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: choose every set of n people for city A.
function bruteMinCost(people) {
  const m = people.length, n = m / 2
  let best = Infinity
  for (let mask = 0; mask < 1 << m; mask++) {
    let count = 0, total = 0
    for (let i = 0; i < m; i++) {
      if (mask & (1 << i)) { count++; total += people[i][0] } else total += people[i][1]
    }
    if (count === n) best = Math.min(best, total)
  }
  return best
}

function seeded(seed) {
  let s = seed
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}

test('phases are well formed', () => {
  assert.ok(phases.length >= 3)
  for (const p of phases) assert.ok(p.id && p.label && p.description)
})

test('sample gives 110', () => {
  assert.equal(buildTrace([[10, 30], [400, 50], [30, 200], [90, 20]]).result, 110)
})

test('every frame has phase, activeLine, message and snapshot', () => {
  const run = buildTrace([[5, 9], [7, 2]])
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.equal(typeof f.activeLine, 'number')
    assert.equal(typeof f.message, 'string')
    assert.ok(f.snapshot && typeof f.snapshot === 'object')
  }
})

test('matches brute force on random small inputs', () => {
  const rnd = seeded(11)
  for (let t = 0; t < 300; t++) {
    const n = 1 + Math.floor(rnd() * 4)
    const people = Array.from({ length: 2 * n }, () => [1 + Math.floor(rnd() * 100), 1 + Math.floor(rnd() * 100)])
    assert.equal(buildTrace(people).result, bruteMinCost(people), JSON.stringify(people))
  }
})

test('parser rejects odd counts and bad costs', () => {
  assert.throws(() => parseInput('[[1,2]]'))
  assert.throws(() => parseInput('[[1,2],[3]]'))
  assert.throws(() => parseInput('[[0,2],[3,4]]'))
})
