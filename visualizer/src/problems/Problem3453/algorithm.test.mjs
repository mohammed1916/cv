import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = squares => buildTrace(parseInput(JSON.stringify({ squares }))).result

test('3453 examples', () => {
  assert.ok(Math.abs(solve([[0, 0, 1], [2, 2, 1]]) - 1) < 1e-5)
  assert.ok(Math.abs(solve([[0, 0, 2]]) - 1) < 1e-5)
})

test('3453 rejects bad input', () => {
  assert.throws(() => parseInput('{"squares":[]}'))
  assert.throws(() => parseInput('{"squares":[[0,0,0]]}'))
  assert.throws(() => parseInput('{"squares":[[11,0,1]]}'))
})

// Independent oracle: the area below a line is piecewise linear in the line's height, with breakpoints at the square
// bottoms and tops. Find the first breakpoint interval where the area reaches half, then solve that linear piece exactly.
function oracle(squares) {
  const total = squares.reduce((s, [, , l]) => s + l * l, 0)
  const half = total / 2
  const below = line => squares.reduce((s, [, y, l]) => s + l * Math.min(l, Math.max(0, line - y)), 0)
  const points = [...new Set(squares.flatMap(([, y, l]) => [y, y + l]))].sort((a, b) => a - b)
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]
    const b = points[i + 1]
    const fa = below(a)
    const fb = below(b)
    if (fb >= half) {
      if (fa >= half) return a
      return a + (half - fa) * (b - a) / (fb - fa)
    }
  }
  return points[points.length - 1]
}

test('3453 random squares match exact piecewise solve', () => {
  let seed = 3453
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const squares = Array.from({ length: 1 + rnd(6) }, () => [rnd(11), rnd(11), 1 + rnd(5)])
    const got = solve(squares)
    const want = oracle(squares)
    assert.ok(Math.abs(got - want) < 1e-5, `${JSON.stringify(squares)} got ${got} want ${want}`)
  }
})
