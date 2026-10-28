import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3572 picks the best y for three distinct x values', () => {
  assert.equal(solve({ x: [1, 2, 1, 3, 2], y: [5, 6, 4, 7, 9] }), 21)
  assert.equal(solve({ x: [1, 1, 2, 3], y: [10, 2, 30, 20] }), 60)
})

test('3572 three values with distinct x', () => {
  assert.equal(solve({ x: [4, 5, 6], y: [1, 2, 3] }), 6)
})

test('3572 rejects fewer than three distinct x values', () => {
  assert.throws(() => parseInput('{"x": [1, 1, 2], "y": [3, 4, 5]}'))
})

// Independent oracle: try every triple of indices and keep the largest sum among those with distinct x values.
function oracle({ x, y }) {
  const n = x.length
  let best = -Infinity
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      for (let c = b + 1; c < n; c++) {
        if (new Set([x[a], x[b], x[c]]).size < 3) continue
        best = Math.max(best, y[a] + y[b] + y[c])
      }
    }
  }
  return best
}

test('3572 random arrays match a triple-enumeration oracle', () => {
  let seed = 3572
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 600 && checked < 200; t++) {
    const n = 3 + rnd(7)
    const x = Array.from({ length: n }, () => 1 + rnd(5))
    const y = Array.from({ length: n }, () => 1 + rnd(20))
    try { parseInput(JSON.stringify({ x, y })) } catch { continue }
    checked++
    assert.equal(solve({ x, y }), oracle({ x, y }), JSON.stringify({ x, y }))
  }
  assert.ok(checked >= 100)
})
