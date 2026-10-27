import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (x, target) => buildTrace({ x, target }).result

test('964 official examples', () => {
  assert.equal(solve(3, 19), 5)
  assert.equal(solve(5, 501), 8)
})

test('964 x itself costs nothing, and 12 = x*x*x + x*x with x = 2 needs four operators', () => {
  assert.equal(solve(7, 7), 0)
  assert.equal(solve(2, 12), 4)
})

test('964 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"x":1,"target":5}'))
  assert.throws(() => parseInput('{"x":3,"target":0}'))
  assert.throws(() => parseInput('[3,19]'))
})

test('964 frames point at valid pseudocode lines', () => {
  const { frames } = buildTrace({ x: 5, target: 501 })
  for (const frame of frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  assert.equal(frames.at(-1).phase, 'done')
})

// Exhaustive minimum over expressions written without parentheses, with the usual precedence,
// that use only x as leaves: 2 <= x <= 5, 1 <= target <= 40. Each entry is the fewest operators.
const exhaustive = {
  2: [1, 0, 2, 1, 3, 2, 4, 2, 4, 3, 5, 4, 6, 4, 5, 3, 5, 4, 6, 5, 7, 6, 8, 6, 8, 7, 8, 6, 7, 5, 6, 4, 6, 5, 7, 6, 8, 7, 9, 7],
  3: [1, 2, 0, 2, 3, 1, 3, 3, 1, 3, 4, 2, 4, 5, 3, 5, 5, 3, 5, 6, 4, 6, 5, 3, 5, 4, 2, 4, 5, 3, 5, 6, 4, 6, 6, 4, 6, 7, 5, 7],
  4: [1, 3, 2, 0, 2, 4, 3, 1, 3, 5, 4, 2, 4, 5, 3, 1, 3, 5, 4, 2, 4, 6, 5, 3, 5, 7, 6, 4, 6, 7, 5, 3, 5, 7, 6, 4, 6, 8, 7, 5],
  5: [1, 3, 4, 2, 0, 2, 4, 5, 3, 1, 3, 5, 6, 4, 2, 4, 6, 6, 4, 2, 4, 6, 5, 3, 1, 3, 5, 6, 4, 2, 4, 6, 7, 5, 3, 5, 7, 8, 6, 4],
}

test('964 matches the exhaustive search for x 2 to 5 and target 1 to 40', () => {
  for (const [x, row] of Object.entries(exhaustive)) {
    row.forEach((expected, index) => {
      assert.equal(solve(Number(x), index + 1), expected, `x=${x} target=${index + 1}`)
    })
  }
})

test('964 python export defines the required function', () => {
  assert.match(python, /def least_ops_express_target\(x, target\):/)
})
