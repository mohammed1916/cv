import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = coins => buildTrace(parseInput(JSON.stringify({ coins }))).result

test('3418 official examples', () => {
  assert.equal(solve([[0, 1, -1], [1, -2, 3], [2, -3, 4]]), 8)
  assert.equal(solve([[10, 10, 10], [10, 10, 10]]), 40)
})

test('3418 neutralizing two robbers beats taking them', () => {
  // The only path is -5, -5, -5; neutralizing two of them leaves -5.
  assert.equal(solve([[-5, -5, -5]]), -5)
})

test('3418 rejects a coin outside -10 to 10', () => {
  assert.throws(() => parseInput(JSON.stringify({ coins: [[11]] })))
})

// Independent oracle: for every path, try every choice of up to two negative cells to neutralize.
function oracle(coins) {
  const m = coins.length
  const n = coins[0].length
  let best = -Infinity
  const evaluate = cells => {
    const negatives = cells.map((v, i) => (v < 0 ? i : -1)).filter(i => i >= 0)
    const options = [[]]
    for (const a of negatives) options.push([a])
    for (let x = 0; x < negatives.length; x++) for (let y = x + 1; y < negatives.length; y++) options.push([negatives[x], negatives[y]])
    for (const chosen of options) {
      const total = cells.reduce((sum, v, i) => sum + (chosen.includes(i) ? 0 : v), 0)
      best = Math.max(best, total)
    }
  }
  const walk = (r, c, cells) => {
    const next = [...cells, coins[r][c]]
    if (r === m - 1 && c === n - 1) { evaluate(next); return }
    if (r + 1 < m) walk(r + 1, c, next)
    if (c + 1 < n) walk(r, c + 1, next)
  }
  walk(0, 0, [])
  return best
}

test('3418 random grids match an enumeration of every path and neutralization', () => {
  let seed = 3418
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    const coins = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(21) - 10))
    assert.equal(solve(coins), oracle(coins), JSON.stringify(coins))
  }
})
