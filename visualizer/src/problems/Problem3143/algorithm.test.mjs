import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3143 examples', () => {
  assert.equal(solve({ points: [[-2, -2], [0, 0]], s: 'ab' }), 2)
  // The two c points are both at distance 1, so they cannot both be inside a square with distinct letters.
  assert.equal(solve({ points: [[1, 1], [-1, -1], [2, -2]], s: 'ccd' }), 0)
  // Distances 1, 2, 2: the ring at distance 2 holds b and c, which are distinct, so all three fit.
  assert.equal(solve({ points: [[1, 1], [-2, -2], [-2, 2]], s: 'abc' }), 3)
})

test('3143 duplicate points are rejected', () => {
  assert.throws(() => parseInput('{"points":[[1,1],[1,1]],"s":"ab"}'))
})

// Independent oracle: try every subset of points. A subset is a valid set of points inside a square
// when its letters are distinct and every chosen point is strictly nearer than every unchosen one.
function oracle(points, s) {
  const n = points.length
  const dist = i => Math.max(Math.abs(points[i][0]), Math.abs(points[i][1]))
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const inside = []
    const outside = []
    for (let i = 0; i < n; i++) (mask & (1 << i) ? inside : outside).push(i)
    const letters = inside.map(i => s[i])
    if (new Set(letters).size !== letters.length) continue
    if (inside.length && outside.length) {
      const farthestIn = Math.max(...inside.map(dist))
      const nearestOut = Math.min(...outside.map(dist))
      if (farthestIn >= nearestOut) continue
    }
    best = Math.max(best, inside.length)
  }
  return best
}

test('3143 random point sets match the subset oracle', () => {
  let seed = 3143
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const count = 1 + rnd(7)
    const seen = new Set()
    const points = []
    while (points.length < count) {
      const p = [rnd(9) - 4, rnd(9) - 4]
      if (seen.has(`${p[0]},${p[1]}`)) continue
      seen.add(`${p[0]},${p[1]}`)
      points.push(p)
    }
    const s = Array.from({ length: count }, () => String.fromCharCode(97 + rnd(3))).join('')
    assert.equal(solve({ points, s }), oracle(points, s), JSON.stringify({ points, s }))
  }
})
