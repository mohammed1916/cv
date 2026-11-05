import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function area(r) { return Math.max(0, r[2] - r[0]) * Math.max(0, r[3] - r[1]) }

test('836 overlap means a positive-area intersection', () => {
  let state = 836
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const rect = () => { const x1 = rand(8), y1 = rand(8); return [x1, y1, x1 + 1 + rand(4), y1 + 1 + rand(4)] }
  for (let t = 0; t < 1000; t++) {
    const a = rect(), b = rect()
    const ix = Math.min(a[2], b[2]) - Math.max(a[0], b[0])
    const iy = Math.min(a[3], b[3]) - Math.max(a[1], b[1])
    const expected = ix > 0 && iy > 0
    assert.equal(buildTrace({ rec1: a, rec2: b }).result, expected, JSON.stringify({ a, b }))
  }
})

test('836 edge-sharing rectangles do not overlap', () => {
  assert.equal(buildTrace({ rec1: [0, 0, 1, 1], rec2: [1, 0, 2, 1] }).result, false)
})

test('836 rejects degenerate rectangles', () => {
  assert.throws(() => parseInput('{"rec1":[0,0,0,1],"rec2":[0,0,1,1]}'))
})
