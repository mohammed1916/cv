import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = points => buildTrace(points).result

test('3027 worked examples', () => {
  assert.equal(solve([[1, 1], [2, 2], [3, 3]]), 0)
  assert.equal(solve([[6, 2], [4, 4], [2, 6]]), 2)
  assert.equal(solve([[3, 1], [1, 3], [1, 1]]), 2)
})

test('3027 edge cases', () => {
  assert.equal(solve([[0, 5], [0, 0]]), 1)
  assert.equal(solve([[0, 0], [0, 5]]), 1)
  assert.equal(solve([[0, 9], [0, 4], [0, 0]]), 2)
  assert.throws(() => parseInput('[[1,1]]'))
  assert.throws(() => parseInput('[[1,1],[1,1]]'))
})

// Independent oracle: brute force over every ordered pair with a bounding-box test, as in problem 3025.
function oracle(points) {
  let count = 0
  for (let i = 0; i < points.length; i++) for (let j = 0; j < points.length; j++) {
    if (i === j) continue
    const [A, B] = [points[i], points[j]]
    const minX = Math.min(A[0], B[0]), maxX = Math.max(A[0], B[0])
    const minY = Math.min(A[1], B[1]), maxY = Math.max(A[1], B[1])
    const aIsUpperLeft = A[0] === minX && A[1] === maxY && B[0] === maxX && B[1] === minY
    if (!aIsUpperLeft) continue
    const inside = points.some((P, k) => k !== i && k !== j && P[0] >= minX && P[0] <= maxX && P[1] >= minY && P[1] <= maxY)
    if (!inside) count++
  }
  return count
}

test('3027 random distinct points match the brute-force oracle', () => {
  let seed = 3027
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 2 + rnd(9)
    const set = new Set()
    while (set.size < size) set.add(`${rnd(7)},${rnd(7)}`)
    const points = [...set].map(s => s.split(',').map(Number))
    assert.equal(solve(points), oracle(points), JSON.stringify(points))
  }
})
