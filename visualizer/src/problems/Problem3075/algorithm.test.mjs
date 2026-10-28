import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3075 official examples', () => {
  assert.equal(solve({ happiness: [1, 2, 3], k: 2 }), 4)
  assert.equal(solve({ happiness: [1, 1, 1, 1], k: 2 }), 1)
  assert.equal(solve({ happiness: [2, 3, 4, 5], k: 1 }), 5)
})

test('3075 happiness never drops below zero', () => {
  assert.equal(solve({ happiness: [1, 1, 1], k: 3 }), 1)
})

test('3075 rejects k larger than the number of children', () => {
  assert.throws(() => parseInput(JSON.stringify({ happiness: [1], k: 2 })))
})

// Independent oracle: try every order of picks and sum the gains directly.
function oracle({ happiness, k }) {
  let best = 0
  const rec = (values, turn, total) => {
    if (turn === k) { best = Math.max(best, total); return }
    for (let i = 0; i < values.length; i++) {
      if (values[i] === null) continue
      const next = values.map((v, j) => (j === i || v === null ? v : Math.max(v - 1, 0)))
      next[i] = null
      rec(next, turn + 1, total + values[i])
    }
  }
  rec([...happiness], 0, 0)
  return best
}

test('3075 random inputs match an exhaustive pick-order oracle', () => {
  let seed = 3075
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const input = { happiness: Array.from({ length: n }, () => 1 + rnd(9)), k: 1 + rnd(n) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
