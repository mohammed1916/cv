import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = numWays => buildTrace(parseInput(JSON.stringify({ numWays }))).result

test('3592 official examples', () => {
  assert.deepEqual(solve([0, 1, 0, 2, 0, 3, 0, 4, 0, 5]), [2, 4, 6])
  assert.deepEqual(solve([1, 2, 2, 3, 4]), [1, 2, 5])
  assert.deepEqual(solve([1, 2, 3, 4, 15]), [])
})

test('3592 a single amount with one way is coin 1', () => {
  assert.deepEqual(solve([1]), [1])
})

test('3592 rejects a count above the cap', () => {
  assert.throws(() => parseInput('{"numWays":[51]}'))
})

// Independent oracle: try every subset of {1..n} as the denominations, count ways by a fresh DP, and keep the one subset that matches.
function oracle(numWays) {
  const n = numWays.length
  const matches = []
  for (let mask = 0; mask < 1 << n; mask++) {
    const coins = []
    for (let c = 1; c <= n; c++) if ((mask >> (c - 1)) & 1) coins.push(c)
    const ways = Array(n + 1).fill(0)
    ways[0] = 1
    for (const c of coins) for (let a = c; a <= n; a++) ways[a] += ways[a - c]
    if (numWays.every((x, i) => ways[i + 1] === x)) matches.push(coins)
  }
  if (matches.length > 1) throw new Error('more than one denomination set matches')
  return matches.length ? matches[0] : []
}

test('3592 random count arrays match a subset-enumeration oracle', () => {
  let seed = 3592
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 200; trial++) {
    const n = 1 + rnd(8)
    let numWays
    if (rnd(2) === 0) {
      const coins = Array.from({ length: n }, (_, i) => i + 1).filter(() => rnd(3) === 0)
      const ways = Array(n + 1).fill(0)
      ways[0] = 1
      for (const c of coins) for (let a = c; a <= n; a++) ways[a] += ways[a - c]
      numWays = ways.slice(1)
    } else {
      numWays = Array.from({ length: n }, () => rnd(6))
    }
    assert.deepEqual(solve(numWays), oracle(numWays), JSON.stringify(numWays))
  }
})
