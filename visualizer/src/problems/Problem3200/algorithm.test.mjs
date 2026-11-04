import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (red, blue) => buildTrace({ red, blue }).result

test('3200 worked examples', () => {
  assert.equal(solve(2, 4), 3)
  assert.equal(solve(2, 1), 2)
  assert.equal(solve(1, 1), 1)
  assert.equal(solve(10, 1), 2)
})

test('3200 edge cases', () => {
  assert.equal(solve(0, 0), 0)
  assert.equal(solve(0, 1), 1)
  assert.equal(solve(0, 2), 1)
  assert.equal(solve(3, 0), 1)
  assert.throws(() => parseInput('{"red":-1,"blue":1}'))
})

// Independent oracle: lay out each candidate triangle row by row, every row in one colour,
// adjacent rows in different colours, and check the ball totals.
function oracle(red, blue) {
  let best = 0
  for (let h = 1; h <= 30; h++) {
    let fits = false
    for (const startColor of ['red', 'blue']) {
      let r = 0, b = 0
      for (let row = 1; row <= h; row++) {
        const color = row % 2 === 1 ? startColor : (startColor === 'red' ? 'blue' : 'red')
        if (color === 'red') r += row; else b += row
      }
      if (r <= red && b <= blue) fits = true
    }
    if (fits) best = h
  }
  return best
}

test('3200 small counts match the explicit-color oracle', () => {
  for (let red = 0; red <= 12; red++) for (let blue = 0; blue <= 12; blue++) {
    assert.equal(solve(red, blue), oracle(red, blue), `red ${red} blue ${blue}`)
  }
})
