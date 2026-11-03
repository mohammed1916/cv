import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

function seeded(seed) {
  let s = seed
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}

// Oracle: try every subsequence of a and check whether it also appears in b in order.
function isSubsequence(sub, arr) {
  let j = 0
  for (const v of arr) if (j < sub.length && v === sub[j]) j++
  return j === sub.length
}
function bruteLinks(a, b) {
  let best = 0
  for (let mask = 0; mask < 1 << a.length; mask++) {
    const sub = a.filter((_, i) => mask & (1 << i))
    if (sub.length > best && isSubsequence(sub, b)) best = sub.length
  }
  return best
}

test('phases are well formed', () => {
  assert.ok(phases.length >= 3)
  for (const p of phases) assert.ok(p.id && p.label && p.description)
})

test('sample has two links', () => {
  assert.equal(buildTrace([[1, 4, 2], [1, 2, 4]]).result, 2)
})

test('matches exhaustive oracle on random small arrays', () => {
  const rnd = seeded(9)
  for (let t = 0; t < 300; t++) {
    const a = Array.from({ length: 1 + Math.floor(rnd() * 8) }, () => Math.floor(rnd() * 4))
    const b = Array.from({ length: 1 + Math.floor(rnd() * 8) }, () => Math.floor(rnd() * 4))
    assert.equal(buildTrace([a, b]).result, bruteLinks(a, b), JSON.stringify([a, b]))
  }
})

test('every frame has phase, activeLine, message and snapshot', () => {
  const run = buildTrace([[1, 2], [2, 1]])
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.equal(typeof f.activeLine, 'number')
    assert.equal(typeof f.message, 'string')
    assert.ok(f.snapshot && typeof f.snapshot === 'object')
  }
})

test('parser rejects malformed arrays', () => {
  assert.throws(() => parseInput('[[1],[]]'))
  assert.throws(() => parseInput('[[10],[1]]'))
  assert.throws(() => parseInput('[1,2]'))
})
