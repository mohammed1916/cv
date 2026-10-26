import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Oracle: count unit cells on a small grid.
function pixels(rects) {
  const cells = new Set()
  for (const [x1, y1, x2, y2] of rects) for (let x = x1; x < x2; x++) for (let y = y1; y < y2; y++) cells.add(x * 1000 + y)
  return cells.size
}
test('official examples', () => {
  assert.equal(buildTrace([[0, 0, 2, 2], [1, 0, 2, 3], [1, 0, 3, 1]]).result, 6)
  assert.equal(buildTrace([[0, 0, 1000000000, 1000000000]]).result, 49)
})
test('random small rectangles match cell counting', () => {
  let seed = 29
  const rnd = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) % n }
  for (let t = 0; t < 400; t++) {
    const rects = Array.from({ length: 1 + rnd(6) }, () => { const x = rnd(9), y = rnd(9); return [x, y, x + 1 + rnd(9 - x === 0 ? 1 : 10), y + 1 + rnd(10)] })
    const tr = buildTrace(rects)
    assert.equal(tr.result, pixels(rects) % 1000000007, JSON.stringify(rects))
    assert.equal(tr.frames[0].phase, 'start'); assert.equal(tr.frames.at(-1).phase, 'done')
  }
})
test('huge coordinates use exact arithmetic', () => {
  // two disjoint 1e9 x 1e9 squares cannot both fit in [0,1e9]; use full square and a sliver: area exact value
  const r = buildTrace([[0, 0, 1000000000, 1000000000], [0, 0, 1000000000, 1]]).result
  assert.equal(r, Number((10n ** 18n) % 1000000007n))
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[[1,1,1,2]]')); assert.throws(() => parseInput('[[0,0,1]]')); assert.throws(() => parseInput('[]'))
})
