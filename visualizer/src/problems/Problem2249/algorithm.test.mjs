import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = circles => buildTrace(parseInput(JSON.stringify({ circles }))).result

test('2249 official examples', () => {
  assert.equal(solve([[2, 2, 1]]), 5)
  assert.equal(solve([[2, 2, 2], [3, 4, 1]]), 16)
})

test('2249 a point on the boundary counts, and overlapping circles count once', () => {
  assert.equal(solve([[0, 0, 1]]), 5)
  assert.equal(solve([[0, 0, 1], [0, 0, 1]]), 5)
  assert.equal(solve([[0, 0, 1], [1, 0, 1]]), 8)
})

test('2249 rejects bad input', () => {
  assert.throws(() => parseInput('{"circles":[[0,0,0]]}'))
  assert.throws(() => parseInput('{"circles":[[7,0,1]]}'))
  assert.throws(() => parseInput('{"circles":[[0,0]]}'))
})

// Independent oracle: enumerate the lattice points of each circle's own bounding square and collect them in a set.
function oracle(circles) {
  const found = new Set()
  for (const [cx, cy, r] of circles) {
    for (let x = cx - r; x <= cx + r; x++) {
      for (let y = cy - r; y <= cy + r; y++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) found.add(`${x},${y}`)
      }
    }
  }
  return found.size
}

test('2249 random circles match the per-circle enumeration oracle', () => {
  let seed = 2249
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const circles = Array.from({ length: 1 + rnd(6) }, () => [rnd(13) - 6, rnd(13) - 6, 1 + rnd(4)])
    assert.equal(solve(circles), oracle(circles), JSON.stringify(circles))
  }
})
