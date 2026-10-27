import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (x, y) => buildTrace(parseInput(JSON.stringify({ x, y }))).result

test('2998 official examples', () => {
  assert.equal(solve(26, 1), 3)
  assert.equal(solve(54, 2), 4)
})

test('2998 equal values need no operations', () => {
  assert.equal(solve(7, 7), 0)
})

test('2998 rejects values outside the visualization cap', () => {
  assert.throws(() => parseInput('{"x":0,"y":3}'))
  assert.throws(() => parseInput('{"x":3,"y":201}'))
})

// Independent oracle: Bellman-Ford style relaxation over a much larger value range, repeated until nothing improves.
function oracle(x, y) {
  const limit = 20 * Math.max(x, y) + 200
  const dist = new Array(limit + 1).fill(Infinity)
  dist[x] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let v = 1; v <= limit; v++) {
      if (dist[v] === Infinity) continue
      const moves = [v - 1, v + 1]
      if (v % 11 === 0) moves.push(v / 11)
      if (v % 5 === 0) moves.push(v / 5)
      for (const w of moves) {
        if (w >= 1 && w <= limit && dist[v] + 1 < dist[w]) {
          dist[w] = dist[v] + 1
          changed = true
        }
      }
    }
  }
  return dist[y]
}

test('2998 every pair up to 40 matches the relaxation oracle', () => {
  for (let x = 1; x <= 40; x++) {
    for (let y = 1; y <= 40; y++) {
      assert.equal(solve(x, y), oracle(x, y), `${x} ${y}`)
    }
  }
})

test('2998 seeded random pairs match the relaxation oracle', () => {
  let seed = 2998
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const x = 1 + rnd(200)
    const y = 1 + rnd(200)
    assert.equal(solve(x, y), oracle(x, y), `${x} ${y}`)
  }
})
