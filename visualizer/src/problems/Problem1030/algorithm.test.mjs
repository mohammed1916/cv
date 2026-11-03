import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

function seeded(seed) {
  let s = seed
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}

test('phases are well formed', () => {
  assert.ok(phases.length >= 3)
  for (const p of phases) assert.ok(p.id && p.label && p.description)
})

test('every cell appears exactly once in nondecreasing distance', () => {
  const rnd = seeded(3)
  for (let t = 0; t < 200; t++) {
    const rows = 1 + Math.floor(rnd() * 12), cols = 1 + Math.floor(rnd() * 12)
    const r = Math.floor(rnd() * rows), c = Math.floor(rnd() * cols)
    const order = buildTrace([rows, cols, r, c]).result
    assert.equal(order.length, rows * cols)
    const keys = new Set(order.map(([a, b]) => `${a},${b}`))
    assert.equal(keys.size, rows * cols)
    let last = -1
    for (const [a, b] of order) {
      const d = Math.abs(a - r) + Math.abs(b - c)
      assert.ok(d >= last)
      last = d
    }
  }
})

test('every frame has phase, activeLine, message and snapshot', () => {
  const run = buildTrace([2, 3, 0, 1])
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.equal(typeof f.activeLine, 'number')
    assert.equal(typeof f.message, 'string')
    assert.ok(f.snapshot && typeof f.snapshot === 'object')
  }
})

test('parser validates centre and size', () => {
  assert.throws(() => parseInput('[2,2,2,0]'))
  assert.throws(() => parseInput('[30,30,0,0]'))
  assert.deepEqual(parseInput('[3,3,1,1]'), [3, 3, 1, 1])
})
