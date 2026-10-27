import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2477 official examples', () => {
  assert.equal(solve({ roads: [[0, 1], [0, 2], [0, 3]], seats: 5 }), 3)
  assert.equal(solve({ roads: [[3, 1], [3, 2], [1, 0], [0, 4], [0, 5], [4, 6]], seats: 2 }), 7)
  assert.equal(solve({ roads: [], seats: 1 }), 0)
})

test('2477 one seat per car sends every city on its own', () => {
  // Path 0-1-2: city 2 sends 1 car through city 1, and city 1 sends 2 people, so 1 + 2 = 3.
  assert.equal(solve({ roads: [[0, 1], [1, 2]], seats: 1 }), 3)
})

test('2477 rejects a road that closes a cycle', () => {
  assert.throws(() => parseInput(JSON.stringify({ roads: [[0, 1], [1, 2], [2, 0]], seats: 2 })))
})

// Independent oracle: count, for every road, how many cities must cross it by walking each
// city's BFS parent path to the capital; each road then costs ceiling(load / seats).
function oracle({ roads, seats }) {
  const n = roads.length + 1
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of roads) { adj[a].push(b); adj[b].push(a) }
  const up = Array(n).fill(-1)
  const seen = Array(n).fill(false)
  seen[0] = true
  const queue = [0]
  for (let q = 0; q < queue.length; q++) {
    for (const w of adj[queue[q]]) if (!seen[w]) { seen[w] = true; up[w] = queue[q]; queue.push(w) }
  }
  const load = Array(n).fill(0)
  for (let city = 1; city < n; city++) {
    for (let x = city; x !== 0; x = up[x]) load[x]++
  }
  let fuel = 0
  for (let city = 1; city < n; city++) fuel += Math.floor((load[city] + seats - 1) / seats)
  return fuel
}

test('2477 random trees match a path-load oracle', () => {
  let seed = 2477
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const roads = []
    for (let i = 1; i < n; i++) roads.push(rnd(2) ? [rnd(i), i] : [i, rnd(i)])
    const input = { roads, seats: 1 + rnd(5) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
