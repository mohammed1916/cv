import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

// Independent oracle: depth-first enumeration of every walk that is affordable, stopping at the first arrival.
function oracle({ cost, edges, source, target, power }) {
  const arrivals = []
  const dfs = (v, left, time) => {
    if (v === target) { arrivals.push([time, left]); return }
    for (const [from, to, t] of edges) {
      if (from === v && left >= cost[v]) dfs(to, left - cost[v], time + t)
    }
  }
  dfs(source, power, 0)
  if (!arrivals.length) return [-1, -1]
  arrivals.sort((x, y) => x[0] - y[0] || y[1] - x[1])
  return arrivals[0]
}

test('3977 authored presets', () => {
  assert.deepEqual(solve({ cost: [2, 1, 3, 1], edges: [[0, 1, 4], [0, 2, 1], [1, 3, 2], [2, 3, 1]], source: 0, target: 3, power: 4 }), [6, 1])
  assert.deepEqual(solve({ cost: [1, 1, 1], edges: [[0, 1, 2], [0, 2, 2], [1, 2, 1]], source: 0, target: 2, power: 3 }), [2, 2])
})

test('3977 source equals target and unreachable target', () => {
  assert.deepEqual(solve({ cost: [5, 1], edges: [[0, 1, 1]], source: 0, target: 0, power: 3 }), [0, 3])
  assert.deepEqual(solve({ cost: [1, 1], edges: [], source: 0, target: 1, power: 2 }), [-1, -1])
})

test('3977 power can run out before the target', () => {
  assert.deepEqual(solve({ cost: [3, 1, 1], edges: [[0, 1, 1], [1, 2, 1]], source: 0, target: 2, power: 3 }), [-1, -1])
})

test('3977 rejects bad input', () => {
  assert.throws(() => parseInput('{"cost":[1],"edges":[],"source":0,"target":2,"power":1}'))
  assert.throws(() => parseInput('{"cost":[1,1],"edges":[[0,1,0]],"source":0,"target":1,"power":1}'))
})

test('3977 random graphs match the walk-enumeration oracle', () => {
  let seed = 3977
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(5)
    const cost = Array.from({ length: n }, () => 1 + rnd(3))
    const edges = []
    for (let e = 0; e < rnd(8); e++) {
      const u = rnd(n), v = rnd(n)
      if (u !== v) edges.push([u, v, 1 + rnd(6)])
    }
    const input = { cost, edges, source: rnd(n), target: rnd(n), power: 1 + rnd(5) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
