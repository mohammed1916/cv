import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = points => buildTrace({ points }).result

function brute(points) {
  if (points.length <= 2) return points.length
  let best = 2
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    let count = 0
    for (const [xk, yk] of points) {
      const cross = (points[j][0] - points[i][0]) * (yk - points[i][1]) - (points[j][1] - points[i][1]) * (xk - points[i][0])
      if (cross === 0) count++
    }
    best = Math.max(best, count)
  }
  return best
}

test('149 sample inputs return the expected counts', () => {
  assert.equal(solve([[1, 1], [2, 2], [3, 3], [0, 5]]), 3)
  assert.equal(solve([[0, 0], [1, 2], [2, 1], [3, 3]]), 2)
  assert.equal(solve([[4, 0]]), 1)
  assert.equal(solve([[0, 0], [5, 5]]), 2)
})

test('149 frames line up with pseudocode and Python', () => {
  assert.equal(python.split('\n').length, code.length)
  for (const frame of buildTrace({ points: [[0, 0], [1, 1], [2, 0], [3, 3]] }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(frame.pythonLine, frame.activeLine)
  }
})

test('149 rejects malformed or duplicate input', () => {
  assert.throws(() => parseInput('[[1,1]]'), /object/)
  assert.throws(() => parseInput('{"points":[[1]]}'), /points/)
  assert.throws(() => parseInput('{"points":[[1,1],[1,1]]}'), /distinct/)
})

test('149 random point sets match a brute-force oracle', () => {
  let seed = 23
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const seen = new Set()
    const points = []
    const target = 1 + rnd(9)
    while (points.length < target) {
      const p = [rnd(7) - 3, rnd(7) - 3]
      if (!seen.has(p.join(','))) { seen.add(p.join(',')); points.push(p) }
    }
    assert.equal(solve(points), brute(points), JSON.stringify(points))
  }
})
