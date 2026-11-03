import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: try every subset of indices (small inputs only).
function bruteLongest(nums) {
  const n = nums.length
  let best = Math.min(n, 2)
  for (let mask = 1; mask < 1 << n; mask++) {
    const idx = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) idx.push(i)
    if (idx.length < 2) continue
    const d = nums[idx[1]] - nums[idx[0]]
    if (idx.every((v, k) => k === 0 || nums[v] - nums[idx[k - 1]] === d)) best = Math.max(best, idx.length)
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

test('sample arithmetic run is found', () => {
  assert.equal(buildTrace([2, 4, 7, 10, 13, 5]).result, 4)
})

test('every frame has phase, activeLine, message and snapshot', () => {
  const run = buildTrace([9, 3, 6, 1])
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.equal(typeof f.activeLine, 'number')
    assert.equal(typeof f.message, 'string')
    assert.ok(f.snapshot && typeof f.snapshot === 'object')
  }
})

test('matches brute force on random small arrays', () => {
  const rnd = seeded(7)
  for (let t = 0; t < 300; t++) {
    const n = 1 + Math.floor(rnd() * 8)
    const nums = Array.from({ length: n }, () => Math.floor(rnd() * 11) - 5)
    assert.equal(buildTrace(nums).result, bruteLongest(nums), JSON.stringify(nums))
  }
})

test('parser rejects out-of-range input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[20000]'))
  assert.deepEqual(parseInput('[1, 2]'), [1, 2])
})
