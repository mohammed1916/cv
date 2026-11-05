import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every triple and keep the largest perimeter that closes a triangle.
function bruteForce(sides) {
  let best = 0
  for (let i = 0; i < sides.length; i++) {
    for (let j = i + 1; j < sides.length; j++) {
      for (let k = j + 1; k < sides.length; k++) {
        const [x, y, z] = [sides[i], sides[j], sides[k]].sort((p, q) => p - q)
        if (x + y > z) best = Math.max(best, x + y + z)
      }
    }
  }
  return best
}

test('976 largest perimeter matches the brute-force oracle', () => {
  const samples = [
    [3, 4, 5], [2, 1, 2], [1, 2, 1, 10], [5, 5, 5, 5], [8, 1, 2, 3, 9], [4, 9, 1, 6, 6, 3],
    [1, 1, 1], [2, 3, 4, 10, 11], [13, 2, 9, 4, 6, 7],
  ]
  for (const sides of samples) {
    assert.equal(buildTrace(parseInput(JSON.stringify({ sides }))).result, bruteForce(sides), JSON.stringify(sides))
  }
})

test('976 returns zero when no triangle exists', () => {
  assert.equal(buildTrace(parseInput('{"sides":[1,1,3,9]}')).result, 0)
})
