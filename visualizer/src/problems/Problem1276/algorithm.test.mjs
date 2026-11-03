import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (tomatoSlices, cheeseSlices) => buildTrace({ tomatoSlices, cheeseSlices }).result

test('1276 sample counts give the expected pairs', () => {
  assert.deepEqual(solve(14, 5), [2, 3])
  assert.deepEqual(solve(0, 0), [0, 0])
  assert.deepEqual(solve(4, 1), [1, 0])
})

test('1276 impossible counts give an empty list', () => {
  assert.deepEqual(solve(3, 1), [])
  assert.deepEqual(solve(2, 5), [])
  assert.deepEqual(solve(20, 2), [])
})

test('1276 rejects malformed input', () => {
  assert.throws(() => parseInput('{"tomatoSlices":-1,"cheeseSlices":0}'), /tomatoSlices/)
  assert.throws(() => parseInput('{"tomatoSlices":4,"cheeseSlices":1.5}'), /cheeseSlices/)
  assert.throws(() => parseInput('[4,1]'), /object/)
})

// Independent oracle: enumerate every nonnegative pair and keep those that use all ingredients.
test('1276 random counts match a brute-force enumeration', () => {
  for (let t = 0; t <= 60; t++) {
    for (let c = 0; c <= 30; c++) {
      const solutions = []
      for (let x = 0; x <= c; x++) {
        const y = c - x
        if (4 * x + 2 * y === t) solutions.push([x, y])
      }
      const got = solve(t, c)
      if (solutions.length === 0) assert.deepEqual(got, [], `t=${t} c=${c}`)
      else assert.deepEqual(got, solutions[0], `t=${t} c=${c}`)
      assert.ok(solutions.length <= 1, `t=${t} c=${c} has more than one solution`)
    }
  }
})
