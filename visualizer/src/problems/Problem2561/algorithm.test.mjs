import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (basket1, basket2) => buildTrace({ basket1, basket2 }).result

test('2561 official examples', () => {
  assert.equal(solve([4, 2, 2, 2], [1, 4, 1, 2]), 1)
  assert.equal(solve([2, 3, 4, 1], [3, 2, 5, 1]), -1)
})

test('2561 identical baskets cost nothing', () => {
  assert.equal(solve([1, 2], [2, 1]), 0)
})

test('2561 rejects a cost above five', () => {
  assert.throws(() => parseInput(JSON.stringify({ basket1: [6], basket2: [1] })))
})

// Independent oracle: Dijkstra over pairs of baskets, where a swap of x (from basket1) and y (from basket2) costs min(x, y).
function oracle(basket1, basket2) {
  const key = (a, b) => `${a.join(',')}|${b.join(',')}`
  const norm = a => [...a].sort((x, y) => x - y)
  const start = [norm(basket1), norm(basket2)]
  const dist = new Map([[key(...start), 0]])
  const pending = [[0, start]]
  while (pending.length > 0) {
    pending.sort((x, y) => x[0] - y[0])
    const [d, [a, b]] = pending.shift()
    if (dist.get(key(a, b)) < d) continue
    if (a.join(',') === b.join(',')) return d
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        const na = [...a]
        const nb = [...b]
        const cost = d + Math.min(a[i], b[j])
        na[i] = b[j]
        nb[j] = a[i]
        const state = [norm(na), norm(nb)]
        const k = key(...state)
        if (!dist.has(k) || dist.get(k) > cost) {
          dist.set(k, cost)
          pending.push([cost, state])
        }
      }
    }
  }
  return -1
}

test('2561 random baskets match a Dijkstra oracle', () => {
  let seed = 2561
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(4)
    const basket1 = Array.from({ length: n }, () => 1 + rnd(5))
    const basket2 = Array.from({ length: n }, () => 1 + rnd(5))
    assert.equal(solve(basket1, basket2), oracle(basket1, basket2), JSON.stringify({ basket1, basket2 }))
  }
})
