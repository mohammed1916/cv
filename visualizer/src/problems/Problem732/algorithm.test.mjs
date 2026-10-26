import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('732 official example', () => {
  // Maximum overlap after each booking; the last two stay at 3 because [10, 40) never meets a fourth booking.
  assert.deepEqual(buildTrace([[10, 20], [50, 60], [10, 40], [5, 15], [5, 10], [25, 55]]).result, [1, 1, 2, 3, 3, 3])
})

// Oracle: count bookings covering each unit cell after every addition and take the maximum.
test('732 random bookings match unit-cell maximum coverage', () => {
  let state = 291
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const ops = Array.from({ length: 1 + rand(10) }, () => { const s = rand(20); return [s, s + 1 + rand(8)] })
    const cover = Array(40).fill(0)
    const expected = ops.map(([s, e]) => {
      for (let c = s; c < e; c++) cover[c]++
      return Math.max(...cover)
    })
    assert.deepEqual(buildTrace(ops).result, expected, JSON.stringify(ops))
  }
})

test('732 rejects reversed bookings', () => {
  assert.throws(() => parseInput('[[5,1]]'))
})
