import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (a, b) => buildTrace({ a, b }).result

test('986 official example', () => {
  assert.deepEqual(solve([[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]), [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]])
})

test('986 an empty list gives no intersections', () => {
  assert.deepEqual(solve([], [[1, 2]]), [])
})

test('986 rejects overlapping intervals within one list', () => {
  assert.throws(() => parseInput('{"a":[[1,5],[3,6]],"b":[]}'))
})

// Independent oracle: compare every pair of intervals, then sort the overlaps.
function oracle(a, b) {
  const out = []
  for (const [s1, e1] of a) for (const [s2, e2] of b) {
    const lo = Math.max(s1, s2), hi = Math.min(e1, e2)
    if (lo <= hi) out.push([lo, hi])
  }
  return out.sort((x, y) => x[0] - y[0] || x[1] - y[1])
}

test('986 random interval lists match an all-pairs check', () => {
  let seed = 137
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const make = () => {
    const list = []
    let at = rnd(5)
    for (let k = 0, count = rnd(6); k < count; k++) {
      const start = at + rnd(4)
      const end = start + rnd(5)
      list.push([start, end])
      at = end + 1 + rnd(3)
    }
    return list
  }
  for (let t = 0; t < 300; t++) {
    const a = make(), b = make()
    assert.deepEqual(solve(a, b), oracle(a, b), JSON.stringify({ a, b }))
  }
})
