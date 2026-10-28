import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (targetX, targetY) => buildTrace({ targetX, targetY }).result

test('2543 official examples', () => {
  assert.equal(solve(6, 9), false)
  assert.equal(solve(4, 7), true)
})

test('2543 edge cases: the start point and a gcd of 3', () => {
  assert.equal(solve(1, 1), true)
  assert.equal(solve(3, 6), false)
})

test('2543 rejects zero and non-object input', () => {
  assert.throws(() => parseInput('{"targetX":0,"targetY":1}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: breadth-first search from (1, 1) over the four moves, with coordinates capped at 256.
function oracle(tx, ty) {
  const LIMIT = 256
  const seen = new Set(['1,1'])
  const queue = [[1, 1]]
  for (let head = 0; head < queue.length; head++) {
    const [x, y] = queue[head]
    if (x === tx && y === ty) return true
    const next = [[2 * x, y], [x, 2 * y]]
    if (y > x) next.push([x, y - x])
    if (x > y) next.push([x - y, y])
    for (const [a, b] of next) {
      if (a > LIMIT || b > LIMIT) continue
      const key = `${a},${b}`
      if (!seen.has(key)) { seen.add(key); queue.push([a, b]) }
    }
  }
  return false
}

test('2543 random targets match a bounded breadth-first search', () => {
  let seed = 2543
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const x = rnd(40) + 1
    const y = rnd(40) + 1
    assert.equal(solve(x, y), oracle(x, y), `${x},${y}`)
  }
})
