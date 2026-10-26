import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function bruteForce(points) {
  // Try all 24 orderings as a cycle p0-p1-p2-p3-p0 and check the square directly.
  const perms = []
  const permute = (arr, rest = []) => { if (!arr.length) perms.push(rest); else arr.forEach((x, i) => permute(arr.filter((_, j) => j !== i), [...rest, x])) }
  permute([0, 1, 2, 3])
  const d = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2
  return perms.some(([a, b, c, e]) => {
    const P = [points[a], points[b], points[c], points[e]]
    const side = d(P[0], P[1])
    return side > 0 && d(P[1], P[2]) === side && d(P[2], P[3]) === side && d(P[3], P[0]) === side && d(P[0], P[2]) === d(P[1], P[3]) && d(P[0], P[2]) === 2 * side
  })
}

test('593 official examples', () => {
  assert.equal(buildTrace([[0, 0], [1, 1], [1, 0], [0, 1]]).result, true)
  assert.equal(buildTrace([[0, 0], [1, 1], [1, 0], [0, 12]]).result, false)
  assert.equal(buildTrace([[1, 0], [-1, 0], [0, 1], [0, 1]]).result, false)
})

test('593 random small point sets agree with a 24-permutation brute force', () => {
  let state = 5
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 2000; t++) {
    const points = Array.from({ length: 4 }, () => [rand(4) - 2, rand(4) - 2])
    assert.equal(buildTrace(points).result, bruteForce(points), JSON.stringify(points))
  }
})

test('593 rejects wrong point counts', () => {
  assert.throws(() => parseInput('[[0,0],[1,1],[2,2]]'))
})
