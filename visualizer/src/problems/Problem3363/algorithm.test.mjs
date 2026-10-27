import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = fruits => buildTrace(parseInput(JSON.stringify({ fruits }))).result

test('3363 official example', () => {
  assert.equal(solve([[1, 2, 3, 4], [5, 6, 8, 7], [9, 10, 11, 12], [13, 14, 15, 16]]), 100)
})

test('3363 a 2 by 2 grid counts every cell once', () => {
  // The diagonal and the two other corners cover all four cells.
  assert.equal(solve([[1, 2], [3, 4]]), 10)
})

test('3363 rejects a grid that is not square', () => {
  assert.throws(() => parseInput(JSON.stringify({ fruits: [[1, 2]] })))
})

// Independent oracle: move the three children one step at a time together, sharing one visited set.
function oracle(fruits) {
  const n = fruits.length
  const key = (r, c) => r * n + c
  let best = 0
  const step = (t, second, third, seen) => {
    if (t === n - 1) {
      if (second[0] === n - 1 && second[1] === n - 1 && third[0] === n - 1 && third[1] === n - 1) {
        let total = 0
        for (const k of seen) total += fruits[Math.floor(k / n)][k % n]
        best = Math.max(best, total)
      }
      return
    }
    for (const [dr, dc] of [[1, -1], [1, 0], [1, 1]]) {
      for (const [er, ec] of [[-1, 1], [0, 1], [1, 1]]) {
        const a = [second[0] + dr, second[1] + dc]
        const b = [third[0] + er, third[1] + ec]
        const inside = p => p[0] >= 0 && p[1] >= 0 && p[0] < n && p[1] < n
        if (!inside(a) || !inside(b)) continue
        const next = new Set(seen)
        next.add(key(t + 1, t + 1))
        next.add(key(a[0], a[1]))
        next.add(key(b[0], b[1]))
        step(t + 1, a, b, next)
      }
    }
  }
  step(0, [0, n - 1], [n - 1, 0], new Set([key(0, 0), key(0, n - 1), key(n - 1, 0)]))
  return best
}

test('3363 random grids match a simultaneous walk of the three children', () => {
  let seed = 3363
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(3)
    const fruits = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd(20)))
    assert.equal(solve(fruits), oracle(fruits), JSON.stringify(fruits))
  }
})
