import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = coords => buildTrace(parseInput(JSON.stringify({ coords }))).result

test('3588 official examples', () => {
  assert.equal(solve([[1, 1], [1, 2], [3, 2], [3, 3]]), 2)
  assert.equal(solve([[1, 1], [2, 2], [3, 3]]), -1)
})

test('3588 a right triangle with axis legs', () => {
  assert.equal(solve([[1, 1], [5, 1], [1, 4]]), 12)
})

test('3588 rejects duplicate points', () => {
  assert.throws(() => parseInput('{"coords":[[1,1],[1,1]]}'))
})

// Independent oracle: test every triple with a cross product, and accept it when two of its points share an x or a y.
function oracle(coords) {
  let best = -1
  const n = coords.length
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) {
    const [p, q, r] = [coords[a], coords[b], coords[c]]
    const twiceArea = Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]))
    if (twiceArea === 0) continue
    const axisSide = p[0] === q[0] || p[1] === q[1] || p[0] === r[0] || p[1] === r[1] || q[0] === r[0] || q[1] === r[1]
    if (axisSide && twiceArea > best) best = twiceArea
  }
  return best
}

test('3588 random point sets match a triple enumeration oracle', () => {
  let seed = 3588
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 200; trial++) {
    const n = 1 + rnd(7)
    const pool = []
    for (let x = 1; x <= 5; x++) for (let y = 1; y <= 5; y++) pool.push([x, y])
    const coords = []
    while (coords.length < n) coords.push(pool.splice(rnd(pool.length), 1)[0])
    assert.equal(solve(coords), oracle(coords), JSON.stringify(coords))
  }
})
