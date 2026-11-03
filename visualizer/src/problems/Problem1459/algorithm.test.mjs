import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'pair', 'sort', 'done'])

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(PHASES.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.columns))
  }
  assert.deepEqual(run.frames.at(-1).rows, run.result)
}

test('1459 lists positive-area rectangles, largest first, then by corners', () => {
  const run = buildTrace(parseInput(JSON.stringify({ Points: [
    { id: 1, x_value: 1, y_value: 1 },
    { id: 2, x_value: 3, y_value: 4 },
    { id: 3, x_value: 1, y_value: 4 },
    { id: 4, x_value: 3, y_value: 1 },
    { id: 5, x_value: 2, y_value: 2 },
  ] })))
  assert.deepEqual(run.result, [
    { p1: '1,1', p2: '3,4', area: 6 },
    { p1: '1,4', p2: '3,1', area: 6 },
    { p1: '1,4', p2: '2,2', area: 2 },
    { p1: '2,2', p2: '3,4', area: 2 },
    { p1: '1,1', p2: '2,2', area: 1 },
    { p1: '2,2', p2: '3,1', area: 1 },
  ])
  checkFrames(run)
})

test('1459 points sharing an x or y value give no rectangle', () => {
  const run = buildTrace(parseInput('{"Points":[{"id":1,"x_value":0,"y_value":0},{"id":2,"x_value":0,"y_value":5},{"id":3,"x_value":0,"y_value":9}]}'))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

// Independent check: brute force over every unordered pair, compared as sets.
test('1459 matches a brute-force count on a small grid', () => {
  const points = [[0, 0], [1, 2], [2, 1], [3, 3], [0, 3]].map(([x, y], index) => ({ id: index + 1, x_value: x, y_value: y }))
  const run = buildTrace({ Points: points })
  let expected = 0
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i], b = points[j]
      if (a.x_value !== b.x_value && a.y_value !== b.y_value) expected++
    }
  }
  assert.equal(run.result.length, expected)
  checkFrames(run)
})
