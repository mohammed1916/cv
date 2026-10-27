import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = squares => buildTrace(parseInput(JSON.stringify({ squares }))).result
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-5, `${actual} is not ${expected}`)

test('3454 official examples', () => {
  close(solve([[0, 0, 1], [2, 2, 1]]), 1)
})

test('3454 overlapping area is counted once', () => {
  // The small square lies inside the large one, so the union area is 4 and the half is 2 at y = 1.
  close(solve([[0, 0, 2], [1, 1, 1]]), 1)
})

test('3454 rejects a side length of zero', () => {
  assert.throws(() => parseInput(JSON.stringify({ squares: [[0, 0, 0]] })))
})

// Independent oracle: find the area below each height column by column, then bisect on the height.
function below(squares, y) {
  const xs = squares.flatMap(([x, , side]) => [x, x + side])
  let area = 0
  for (let col = Math.min(...xs); col < Math.max(...xs); col++) {
    const intervals = squares
      .filter(([x, , side]) => x <= col && col < x + side)
      .map(([, sy, side]) => [sy, Math.min(sy + side, y)])
      .filter(([a, b]) => b > a)
      .sort((p, q) => p[0] - q[0])
    let length = 0
    let start = null
    let end = null
    for (const [a, b] of intervals) {
      if (start === null) { start = a; end = b } else if (a <= end) end = Math.max(end, b)
      else { length += end - start; start = a; end = b }
    }
    if (start !== null) length += end - start
    area += length
  }
  return area
}

function oracle(squares) {
  const total = below(squares, Infinity)
  const half = total / 2
  let lo = Math.min(...squares.map(([, y]) => y))
  let hi = Math.max(...squares.map(([, y, side]) => y + side))
  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2
    if (below(squares, mid) >= half) hi = mid
    else lo = mid
  }
  return hi
}

test('3454 random squares match a column-by-column bisection oracle', () => {
  let seed = 3454
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const count = 1 + rnd(5)
    const squares = Array.from({ length: count }, () => [rnd(7), rnd(7), 1 + rnd(4)])
    close(solve(squares), oracle(squares))
  }
})
