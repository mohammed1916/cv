import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Amount reaching glass (r, c) computed by recursion over the two glasses above it.
function inflow(poured, r, c) {
  if (r === 0) return poured
  let total = 0
  for (const [pr, pc] of [[r - 1, c - 1], [r - 1, c]]) {
    if (pc < 0 || pc > pr) continue
    total += Math.max(0, inflow(poured, pr, pc) - 1) / 2
  }
  return total
}

test('799 known values', () => {
  assert.equal(buildTrace({ poured: 2, row: 1, glass: 0 }).result, 0.5)
  assert.equal(buildTrace({ poured: 1, row: 2, glass: 1 }).result, 0)
  assert.equal(buildTrace({ poured: 100, row: 0, glass: 0 }).result, 1)
})

test('799 every glass in rows up to 8 matches the recursive inflow', () => {
  for (let poured = 0; poured <= 20; poured += 3) {
    for (let r = 0; r <= 8; r++) {
      for (let c = 0; c <= r; c++) {
        const expected = Math.min(1, inflow(poured, r, c))
        assert.ok(Math.abs(buildTrace({ poured, row: r, glass: c }).result - expected) < 1e-9, JSON.stringify({ poured, r, c }))
      }
    }
  }
})

test('799 rejects a glass outside its row', () => {
  assert.throws(() => parseInput('{"poured":1,"query_row":1,"query_glass":2}'))
})
