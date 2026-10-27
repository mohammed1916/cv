import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2462 official examples', () => {
  assert.equal(solve({ costs: [17, 12, 10, 2, 7, 2, 11, 20, 8], k: 3, candidates: 4 }), 11)
  assert.equal(solve({ costs: [1, 2, 4, 1], k: 3, candidates: 3 }), 4)
})

test('2462 edge cases where the pools overlap or hold one worker', () => {
  assert.equal(solve({ costs: [5], k: 1, candidates: 1 }), 5)
  assert.equal(solve({ costs: [9, 1, 9], k: 2, candidates: 3 }), 10)
})

test('2462 rejects an empty worker list and k above the worker count', () => {
  assert.throws(() => parseInput('{"costs":[],"k":1,"candidates":1}'))
  assert.throws(() => parseInput('{"costs":[3,4],"k":3,"candidates":1}'))
})

// Independent oracle: each round, take the candidates at both ends of the unhired list and remove the chosen worker by value.
function oracle({ costs, k, candidates }) {
  const left = costs.map((_, i) => i)
  let total = 0
  for (let round = 0; round < k; round++) {
    const window = new Set([...left.slice(0, candidates), ...left.slice(-candidates)])
    let best = null
    for (const i of window) if (best === null || costs[i] < costs[best] || (costs[i] === costs[best] && i < best)) best = i
    total += costs[best]
    left.splice(left.indexOf(best), 1)
  }
  return total
}

test('2462 random inputs match a remove-and-scan oracle', () => {
  let seed = 2462
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const input = { costs: Array.from({ length: n }, () => 1 + rnd(20)), k: 1 + rnd(n), candidates: 1 + rnd(n) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
