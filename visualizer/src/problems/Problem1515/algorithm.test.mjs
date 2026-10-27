import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = positions => buildTrace(parseInput(JSON.stringify({ positions }))).result

test('1515 examples with known minima', () => {
  assert.ok(Math.abs(solve([[0, 0]]) - 0) < 1e-5)
  assert.ok(Math.abs(solve([[0, 0], [10, 0]]) - 10) < 1e-5)
  // The centre of a square is the median by symmetry: four diagonals of length sqrt(2).
  assert.ok(Math.abs(solve([[0, 0], [0, 2], [2, 0], [2, 2]]) - 4 * Math.SQRT2) < 1e-5)
})

test('1515 rejects bad input', () => {
  assert.throws(() => parseInput('{"positions":[]}'))
  assert.throws(() => parseInput('{"positions":[[1,2,3]]}'))
  assert.throws(() => parseInput('{"positions":[[101,0]]}'))
})

// Independent oracle: nested ternary search. The total distance is convex, so the minimum over y for each x is convex in x.
function oracle(positions) {
  const f = (x, y) => positions.reduce((s, [px, py]) => s + Math.sqrt((px - x) ** 2 + (py - y) ** 2), 0)
  const inner = x => {
    let lo = 0
    let hi = 100
    for (let i = 0; i < 200; i++) {
      const m1 = lo + (hi - lo) / 3
      const m2 = hi - (hi - lo) / 3
      if (f(x, m1) < f(x, m2)) hi = m2
      else lo = m1
    }
    return f(x, (lo + hi) / 2)
  }
  let lo = 0
  let hi = 100
  for (let i = 0; i < 200; i++) {
    const m1 = lo + (hi - lo) / 3
    const m2 = hi - (hi - lo) / 3
    if (inner(m1) < inner(m2)) hi = m2
    else lo = m1
  }
  return inner((lo + hi) / 2)
}

test('1515 random point sets match nested ternary search', () => {
  let seed = 1515
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 60; t++) {
    const positions = []
    for (let i = 0; i < 1 + rnd(7); i++) positions.push([rnd(101), rnd(101)])
    const got = solve(positions)
    const want = oracle(positions)
    assert.ok(Math.abs(got - want) < 1e-5 * Math.max(1, want), `${JSON.stringify(positions)} got ${got} want ${want}`)
  }
})
