import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('729 official examples', () => {
  assert.deepEqual(buildTrace([[10, 20], [15, 25], [20, 30]]).result, [true, false, true])
  assert.deepEqual(buildTrace([[1, 2], [2, 3], [3, 4], [1, 3]]).result, [true, true, true, false])
})

// Oracle: mark unit cells; a booking is accepted when none of its unit cells is already marked.
test('729 random bookings match a unit-cell occupancy check', () => {
  let state = 261
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const ops = Array.from({ length: 1 + rand(12) }, () => { const s = rand(30); return [s, s + 1 + rand(6)] })
    const cells = new Set()
    const expected = ops.map(([s, e]) => {
      const free = Array.from({ length: e - s }, (_, i) => s + i).every(c => !cells.has(c))
      if (free) for (let c = s; c < e; c++) cells.add(c)
      return free
    })
    assert.deepEqual(buildTrace(ops).result, expected, JSON.stringify(ops))
  }
})

test('729 rejects empty bookings', () => {
  assert.throws(() => parseInput('[[3,3]]'))
})
