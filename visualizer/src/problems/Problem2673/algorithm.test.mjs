import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2673 official examples', () => {
  assert.equal(solve({ n: 7, cost: [1, 5, 2, 2, 3, 3, 1] }), 6)
  assert.equal(solve({ n: 3, cost: [5, 3, 3] }), 0)
})

test('2673 a single pair of leaves needs the difference of their costs', () => {
  assert.equal(solve({ n: 3, cost: [1, 2, 5] }), 3)
})

test('2673 rejects an even n', () => {
  assert.throws(() => parseInput(JSON.stringify({ n: 4, cost: [1, 1, 1, 1] })))
})

// Independent oracle: brute force every increment vector with each node raised by 0 to 4.
// Costs are 1 to 3 and n is at most 7, so 4 is enough: the greedy never raises a node by more.
function oracle({ n, cost }) {
  const paths = []
  const walk = (i, acc) => {
    const here = [...acc, i]
    if (2 * i > n) { paths.push(here); return }
    walk(2 * i, here)
    walk(2 * i + 1, here)
  }
  walk(1, [])
  let best = Infinity
  const inc = Array(n).fill(0)
  const search = (index, spent) => {
    if (spent >= best) return
    if (index === n) {
      const sums = paths.map(p => p.reduce((s, node) => s + cost[node - 1] + inc[node - 1], 0))
      if (sums.every(s => s === sums[0])) best = spent
      return
    }
    for (let d = 0; d <= 4; d++) {
      inc[index] = d
      search(index + 1, spent + d)
    }
    inc[index] = 0
  }
  search(0, 0)
  return best
}

test('2673 random small trees match a brute-force increment oracle', () => {
  let seed = 2673
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 60; t++) {
    const n = [3, 5, 7][rnd(3)]
    const cost = Array.from({ length: n }, () => 1 + rnd(3))
    const input = { n, cost }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
