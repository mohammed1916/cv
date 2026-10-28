import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s1, s2, x) => buildTrace({ s1, s2, x }).result

test('2896 official examples', () => {
  assert.equal(solve('1100011000', '0101001010', 2), 4)
  assert.equal(solve('10110', '00011', 4), -1)
})

test('2896 edge cases', () => {
  assert.equal(solve('0101', '0101', 3), 0)
  // One mismatch cannot be paired.
  assert.equal(solve('100', '000', 5), -1)
})

test('2896 rejects bad input', () => {
  assert.throws(() => parseInput('{"s1": "10", "s2": "1", "x": 2}'), /same length/)
  assert.throws(() => parseInput('{"s1": "12", "s2": "10", "x": 2}'), /binary/)
  assert.throws(() => parseInput('{"s1": "10", "s2": "01", "x": 0}'), /1 to 20/)
})

// Independent oracle: shortest path over every bit pattern of s1, using Dijkstra with the two operations as edges.
function oracle(s1, s2, x) {
  const n = s1.length
  const toMask = s => [...s].reduce((m, c, i) => m | (Number(c) << i), 0)
  const start = toMask(s1)
  const goal = toMask(s2)
  const dist = new Array(1 << n).fill(Infinity)
  const done = new Array(1 << n).fill(false)
  dist[start] = 0
  for (;;) {
    let u = -1
    for (let m = 0; m < dist.length; m++) {
      if (!done[m] && dist[m] < Infinity && (u < 0 || dist[m] < dist[u])) u = m
    }
    if (u < 0) break
    done[u] = true
    const moves = []
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) moves.push([u ^ (1 << i) ^ (1 << j), x])
    }
    for (let i = 0; i < n - 1; i++) moves.push([u ^ (1 << i) ^ (1 << (i + 1)), 1])
    for (const [v, cost] of moves) {
      if (dist[u] + cost < dist[v]) dist[v] = dist[u] + cost
    }
  }
  return dist[goal] === Infinity ? -1 : dist[goal]
}

test('2896 random strings match a shortest-path oracle', () => {
  let seed = 2896
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    let s1 = ''
    let s2 = ''
    for (let i = 0; i < n; i++) {
      s1 += '01'[rnd(2)]
      s2 += '01'[rnd(2)]
    }
    const x = 1 + rnd(5)
    assert.equal(solve(s1, s2, x), oracle(s1, s2, x), `${s1} ${s2} ${x}`)
  }
})
