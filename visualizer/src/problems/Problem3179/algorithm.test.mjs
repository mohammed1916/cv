import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, k) => buildTrace(parseInput(JSON.stringify({ n, k }))).result

test('3179 official examples', () => {
  assert.equal(solve(4, 5), 56)
  assert.equal(solve(5, 3), 35)
})

test('3179 a single position never changes', () => {
  assert.equal(solve(1, 7), 1)
})

test('3179 rejects n or k outside the visualization caps', () => {
  assert.throws(() => parseInput('{"n":31,"k":2}'))
  assert.throws(() => parseInput('{"n":3,"k":0}'))
})

// Independent oracle: after k seconds the last value is the binomial C(n - 1 + k, n - 1), taken modulo 1e9+7.
function oracle(n, k) {
  const r = BigInt(n - 1)
  const total = BigInt(n - 1 + k)
  let c = 1n
  for (let i = 1n; i <= r; i++) c = (c * (total - r + i)) / i
  return Number(c % 1000000007n)
}

test('3179 random cases match the binomial oracle', () => {
  let seed = 3179
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(30) + 1
    const k = rnd(30) + 1
    assert.equal(solve(n, k), oracle(n, k), `n=${n} k=${k}`)
  }
})
