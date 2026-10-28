import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2335 official examples', () => {
  assert.equal(solve({ amount: [1, 4, 2] }), 4)
  assert.equal(solve({ amount: [5, 4, 4] }), 7)
  assert.equal(solve({ amount: [5, 0, 0] }), 5)
})

test('2335 all empty cups need no time', () => {
  assert.equal(solve({ amount: [0, 0, 0] }), 0)
})

test('2335 rejects a cup count other than three', () => {
  assert.throws(() => parseInput('{"amount":[1,2]}'))
})

// Independent oracle: exhaustive search over every choice of two cups each second, memoised on the remaining amounts.
function oracle({ amount }) {
  const memo = new Map()
  const best = state => {
    if (state.every(v => v === 0)) return 0
    const key = state.join(',')
    if (memo.has(key)) return memo.get(key)
    let result = Infinity
    for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) {
      const next = [...state]
      if (next[i] > 0) next[i] -= 1
      if (next[j] > 0) next[j] -= 1
      if (next.join(',') === state.join(',')) continue
      result = Math.min(result, 1 + best(next))
    }
    memo.set(key, result)
    return result
  }
  return best(amount)
}

test('2335 random cups match an exhaustive search oracle', () => {
  let seed = 2335
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { amount: [rnd(9), rnd(9), rnd(9)] }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
