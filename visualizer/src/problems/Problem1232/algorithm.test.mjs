import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: every triple of points must be collinear by a cross product of two edges from the first point.
function oracle(points) {
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) for (let k = j + 1; k < points.length; k++) {
    const ax = points[j][0] - points[i][0], ay = points[j][1] - points[i][1]
    const bx = points[k][0] - points[i][0], by = points[k][1] - points[i][1]
    if (ax * by - ay * bx !== 0) return false
  }
  return true
}

test('a diagonal line with negative coordinates is a straight line', () => {
  assert.equal(buildTrace({ coordinates: [[-6, -9], [-2, -1], [0, 3], [3, 9], [7, 17], [10, 23]] }).result, true)
})

test('a vertical line is straight, and a point off the line breaks it', () => {
  assert.equal(buildTrace({ coordinates: [[4, -3], [4, 0], [4, 8]] }).result, true)
  assert.equal(buildTrace({ coordinates: [[1, 2], [3, 6], [5, 11]] }).result, false)
})

test('any two distinct points define a line', () => {
  assert.equal(buildTrace({ coordinates: [[-8, 3], [7, -4]] }).result, true)
})

test('random small point sets agree with the triple oracle', () => {
  let state = 61
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return (state >>> 16) % m }
  for (let t = 0; t < 500; t++) {
    const count = 2 + rand(5)
    const seen = new Set()
    const points = []
    while (points.length < count) {
      const p = [rand(7) - 3, rand(7) - 3]
      if (!seen.has(p.join(','))) { seen.add(p.join(',')); points.push(p) }
    }
    assert.equal(buildTrace({ coordinates: points }).result, oracle(points), JSON.stringify(points))
  }
})

test('parseInput rejects duplicate points and out-of-range values', () => {
  assert.throws(() => parseInput('{"coordinates":[[1,1],[1,1]]}'))
  assert.throws(() => parseInput('{"coordinates":[[10001,0],[0,0]]}'))
  assert.throws(() => parseInput('{"coordinates":[[0,0]]}'))
})
