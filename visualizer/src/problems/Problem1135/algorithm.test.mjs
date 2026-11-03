import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, python } from './algorithm.js'

const solve = (cities, roads) => buildTrace({ cities, roads }).result

// Brute force: try every subset of roads, keep the cheapest subset that connects all cities.
function brute(cities, roads) {
  let best = -1
  for (let mask = 0; mask < 1 << roads.length; mask++) {
    const parent = Array.from({ length: cities + 1 }, (_, i) => i)
    const find = x => { while (parent[x] !== x) x = parent[x]; return x }
    let cost = 0
    let count = 0
    for (let i = 0; i < roads.length; i++) {
      if (!(mask & (1 << i))) continue
      const [a, b, c] = roads[i]
      cost += c
      count++
      const ra = find(a)
      const rb = find(b)
      if (ra !== rb) parent[ra] = rb
    }
    const root = find(1)
    let connected = true
    for (let v = 2; v <= cities; v++) if (find(v) !== root) connected = false
    if (connected && (best === -1 || cost < best)) best = cost
    void count
  }
  return best
}

test('1135 hand-checked cases', () => {
  assert.equal(solve(3, [[1, 2, 5], [1, 3, 6], [2, 3, 1]]), 6)
  assert.equal(solve(4, [[1, 2, 3], [3, 4, 4]]), -1)
  assert.equal(solve(1, []), 0)
  assert.equal(solve(2, [[1, 2, 0]]), 0)
})

test('1135 Kruskal matches a subset brute force on seeded graphs', () => {
  let seed = 1135
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const cities = 1 + rnd(5)
    const roads = []
    const count = rnd(8)
    for (let i = 0; i < count && cities > 1; i++) {
      const a = 1 + rnd(cities)
      let b = 1 + rnd(cities)
      if (b === a) b = (a % cities) + 1
      roads.push([a, b, rnd(20)])
    }
    assert.equal(solve(cities, roads), brute(cities, roads), JSON.stringify({ cities, roads }))
  }
})

test('1135 frames carry phase, line, message and snapshot', () => {
  const { frames } = buildTrace({ cities: 3, roads: [[1, 2, 5], [2, 3, 1], [1, 3, 2]] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.equal(typeof frame.activeLine, 'number')
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(frames.at(-1).phase, 'done')
})

test('1135 parser rejects bad input', () => {
  assert.throws(() => parseInput('{"cities":2}'))
  assert.throws(() => parseInput({ cities: 2, roads: [[1, 3, 4]] }))
  assert.throws(() => parseInput({ cities: 2, roads: [[1, 2]] }))
  assert.throws(() => parseInput({ cities: 2, roads: [[1, 2, -1]] }))
})
