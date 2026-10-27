import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2250 examples', () => {
  assert.deepEqual(solve({ rectangles: [[1, 2], [2, 3], [2, 5]], points: [[2, 1], [1, 4]] }), [2, 1])
  assert.deepEqual(solve({ rectangles: [[1, 1], [2, 2], [3, 3]], points: [[1, 3], [1, 1]] }), [1, 3])
})

test('2250 boundary points count and a point beyond every length counts nothing', () => {
  // The point (2, 2) sits exactly on the corner of the rectangle with length 2 and height 2.
  assert.deepEqual(solve({ rectangles: [[2, 2]], points: [[2, 2], [3, 0]] }), [1, 0])
})

test('2250 rejects an out-of-range height and a missing points list', () => {
  assert.throws(() => parseInput('{"rectangles":[[1,101]],"points":[[1,1]]}'))
  assert.throws(() => parseInput('{"rectangles":[[1,1]]}'))
})

// Independent oracle: test every rectangle against every point directly.
test('2250 random inputs match a direct containment oracle', () => {
  let seed = 2250
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rectangles = Array.from({ length: 1 + rnd(8) }, () => [1 + rnd(12), 1 + rnd(12)])
    const points = Array.from({ length: 1 + rnd(8) }, () => [1 + rnd(12), rnd(13)])
    const expected = points.map(([x, y]) => rectangles.filter(([l, h]) => x <= l && y <= h).length)
    assert.deepEqual(solve({ rectangles, points }), expected, JSON.stringify({ rectangles, points }))
  }
})
