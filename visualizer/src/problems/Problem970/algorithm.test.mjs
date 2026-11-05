import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: raise each base to every exponent up to 40 and keep the sums within the bound.
function bruteForce(x, y, bound) {
  const found = new Set()
  for (let i = 0; i <= 40; i++) {
    for (let j = 0; j <= 40; j++) {
      const sum = x ** i + y ** j
      if (sum <= bound) found.add(sum)
    }
  }
  return [...found].sort((p, q) => p - q)
}

test('970 powerful integers match the brute-force oracle', () => {
  const cases = [
    [2, 3, 10], [3, 5, 15], [1, 1, 10], [1, 4, 20], [2, 2, 0], [2, 2, 1], [2, 2, 2],
    [4, 9, 200], [7, 2, 130], [11, 13, 500], [20, 20, 500], [5, 1, 60],
  ]
  for (const [x, y, bound] of cases) {
    const run = buildTrace(parseInput(JSON.stringify({ x, y, bound })))
    assert.deepEqual(run.result, bruteForce(x, y, bound), `${x} ${y} ${bound}`)
  }
})

test('970 keeps each distinct sum once', () => {
  const run = buildTrace(parseInput('{"x":2,"y":2,"bound":20}'))
  assert.deepEqual(run.result, [2, 3, 4, 5, 6, 8, 9, 10, 12, 16, 17, 18, 20])
})
