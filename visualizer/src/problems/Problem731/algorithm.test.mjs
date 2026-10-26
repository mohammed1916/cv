import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('731 official-style example', () => {
  assert.deepEqual(buildTrace([[10, 20], [50, 60], [10, 40], [5, 15], [5, 10], [25, 55]]).result, [true, true, true, false, true, true])
})

// Oracle: count, for each unit cell, how many accepted bookings cover it; a booking is refused when a cell it covers reaches 3.
test('731 random bookings match a unit-cell count of coverage', () => {
  let state = 281
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const ops = Array.from({ length: 1 + rand(12) }, () => { const s = rand(20); return [s, s + 1 + rand(8)] })
    const cover = Array(40).fill(0)
    const expected = ops.map(([s, e]) => {
      const ok = Array.from({ length: e - s }, (_, i) => s + i).every(c => cover[c] < 2)
      if (ok) for (let c = s; c < e; c++) cover[c]++
      return ok
    })
    assert.deepEqual(buildTrace(ops).result, expected, JSON.stringify(ops))
  }
})

test('731 rejects empty bookings', () => {
  assert.throws(() => parseInput('[[4,4]]'))
})
