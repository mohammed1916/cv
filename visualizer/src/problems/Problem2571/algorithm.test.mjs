import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('2571 official examples', () => {
  assert.equal(solve(39), 3)
  assert.equal(solve(54), 3)
})

test('2571 edge cases: one and three', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(3), 2)
})

test('2571 rejects zero and values above the cap', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":10001}'))
})

// Independent oracle: breadth-first search over values, where each move adds or subtracts a power of two.
function oracle(n) {
  const limit = 4 * n + 8
  const dist = new Map([[n, 0]])
  const queue = [n]
  for (let head = 0; head < queue.length; head++) {
    const x = queue[head]
    if (x === 0) return dist.get(0)
    for (let p = 1; p <= limit; p *= 2) {
      for (const y of [x + p, x - p]) {
        if (y < 0 || y > limit || dist.has(y)) continue
        dist.set(y, dist.get(x) + 1)
        queue.push(y)
      }
    }
  }
  return -1
}

test('2571 values up to 300 match a breadth-first oracle', () => {
  for (let n = 1; n <= 300; n++) {
    assert.equal(solve(n), oracle(n), `n = ${n}`)
  }
})

test('2571 random values up to 10000 match a breadth-first oracle', () => {
  let seed = 2571
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 100; t++) {
    const n = 1 + rnd(2000)
    assert.equal(solve(n), oracle(n), `n = ${n}`)
  }
})
