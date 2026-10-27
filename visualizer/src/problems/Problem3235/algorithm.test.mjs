import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (x, y, circles) => buildTrace(parseInput(JSON.stringify({ x, y, circles }))).result

test('3235 official examples', () => {
  assert.equal(solve(3, 3, [[2, 1, 1]]), true)
  assert.equal(solve(3, 3, [[1, 1, 3]]), false)
})

test('3235 a circle that touches both walls blocks the corner', () => {
  // A circle that touches the left and bottom edges walls off the start corner by itself.
  assert.equal(solve(5, 5, [[1, 1, 1]]), false)
  // A circle that touches neither edge leaves the way around it open.
  assert.equal(solve(5, 5, [[2, 2, 1]]), true)
  assert.equal(solve(5, 5, [[0, 2, 2], [4, 2, 2]]), false)
})

test('3235 rejects bad input', () => {
  assert.throws(() => parseInput('{"x":0,"y":3,"circles":[[1,1,1]]}'))
  assert.throws(() => parseInput('{"x":3,"y":3,"circles":[[1,1,0]]}'))
  assert.throws(() => parseInput('{"x":3,"y":3,"circles":[[11,1,1]]}'))
})

// Independent oracle: union-find over circles plus the two walls, instead of a breadth-first search.
function oracle(x, y, circles) {
  const n = circles.length
  const parent = Array.from({ length: n + 2 }, (_, i) => i)
  const TL = n
  const BR = n + 1
  const find = a => (parent[a] === a ? a : (parent[a] = find(parent[a])))
  const join = (a, b) => { parent[find(a)] = find(b) }
  const near = (px, py, lo, hi, v) => Math.min(Math.max(v, lo), hi)
  const d2 = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2
  for (const [cx, cy, r] of circles) {
    if (d2(cx, cy, 0, 0) <= r * r || d2(cx, cy, x, y) <= r * r) return false
  }
  circles.forEach(([cx, cy, r], i) => {
    const left = d2(cx, cy, 0, near(0, 0, 0, y, cy))
    const top = d2(cx, cy, near(0, 0, 0, x, cx), y)
    const bottom = d2(cx, cy, near(0, 0, 0, x, cx), 0)
    const right = d2(cx, cy, x, near(0, 0, 0, y, cy))
    if (left <= r * r || top <= r * r) join(i, TL)
    if (bottom <= r * r || right <= r * r) join(i, BR)
    circles.forEach(([dx, dy, s], j) => { if (j > i && d2(cx, cy, dx, dy) <= (r + s) ** 2) join(i, j) })
  })
  return find(TL) !== find(BR)
}

test('3235 random rectangles match the union-find oracle', () => {
  let seed = 3235
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const x = 1 + rnd(10)
    const y = 1 + rnd(10)
    const circles = Array.from({ length: 1 + rnd(5) }, () => [rnd(11), rnd(11), 1 + rnd(5)])
    assert.equal(solve(x, y, circles), oracle(x, y, circles), JSON.stringify({ x, y, circles }))
  }
})
