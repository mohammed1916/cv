import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const d2 = ([x, y]) => x * x + y * y

test('973 returns k points whose distances are the smallest ones', () => {
  const cases = [
    { points: [[1, 3], [-2, 2]], k: 1 },
    { points: [[3, 3], [5, -1], [-2, 4]], k: 2 },
    { points: [[0, 0], [4, 4], [-1, 1], [2, -5], [7, 0]], k: 3 },
    { points: [[9, 9], [1, 0], [0, 2], [-3, -3], [5, 5], [6, -1]], k: 4 },
  ]
  for (const input of cases) {
    const { result } = buildTrace(parseInput(JSON.stringify(input)))
    assert.equal(result.length, input.k)
    const expected = input.points.map(d2).sort((p, q) => p - q).slice(0, input.k)
    assert.deepEqual(result.map(d2).sort((p, q) => p - q), expected)
    for (const point of result) {
      assert.ok(input.points.some(p => p[0] === point[0] && p[1] === point[1]))
    }
  }
})

test('973 rejects k outside the number of points', () => {
  assert.throws(() => parseInput('{"points":[[1,1]],"k":2}'))
  assert.throws(() => parseInput('{"points":[[1,1,1]],"k":1}'))
})
