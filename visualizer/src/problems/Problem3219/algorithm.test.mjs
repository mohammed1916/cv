import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3219 official examples', () => {
  assert.equal(solve({ m: 3, n: 2, horizontalCut: [1, 3], verticalCut: [5] }), 13)
  assert.equal(solve({ m: 2, n: 2, horizontalCut: [7], verticalCut: [4] }), 15)
})

test('3219 a single piece needs no cuts', () => {
  assert.equal(solve({ m: 1, n: 1, horizontalCut: [], verticalCut: [] }), 0)
})

test('3219 rejects cut lists of the wrong length', () => {
  assert.throws(() => parseInput(JSON.stringify({ m: 3, n: 2, horizontalCut: [1], verticalCut: [5] })))
})

// Independent oracle: dynamic programming over which cuts are already made, trying every next cut.
function oracle({ m, n, horizontalCut, verticalCut }) {
  const H = m - 1
  const V = n - 1
  const memo = new Map()
  const count = mask => { let c = 0; for (let b = mask; b; b &= b - 1) c++; return c }
  const best = (hMask, vMask) => {
    if (hMask === (1 << H) - 1 && vMask === (1 << V) - 1) return 0
    const key = hMask * (1 << V) + vMask
    if (memo.has(key)) return memo.get(key)
    let result = Infinity
    for (let i = 0; i < H; i++) {
      if (hMask & (1 << i)) continue
      result = Math.min(result, horizontalCut[i] * (count(vMask) + 1) + best(hMask | (1 << i), vMask))
    }
    for (let j = 0; j < V; j++) {
      if (vMask & (1 << j)) continue
      result = Math.min(result, verticalCut[j] * (count(hMask) + 1) + best(hMask, vMask | (1 << j)))
    }
    memo.set(key, result)
    return result
  }
  return best(0, 0)
}

test('3219 random cakes match a bitmask-DP oracle', () => {
  let seed = 3219
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const input = {
      m,
      n,
      horizontalCut: Array.from({ length: m - 1 }, () => 1 + rnd(20)),
      verticalCut: Array.from({ length: n - 1 }, () => 1 + rnd(20)),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
