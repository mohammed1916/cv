import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = rows => buildTrace(rows).result

test('2931 a single shop must be bought lowest first', () => {
  // Buying 1, 2, 3 on days 1, 2, 3 gives 1 + 4 + 9.
  assert.equal(solve([[3, 2, 1]]), 14)
})

test('2931 two shops share the cheapest items across days', () => {
  assert.equal(solve([[2, 1], [2, 1]]), 17)
})

test('2931 rejects a shop whose prices are not sorted high to low', () => {
  assert.throws(() => parseInput('[[1,2]]'))
})

// Independent oracle: try every order of shop choices. Each day takes the last remaining item of the chosen shop.
function oracle(rows) {
  const left = rows.map(row => row.length)
  let best = 0
  const go = (day, spent) => {
    if (left.every(c => c === 0)) {
      best = Math.max(best, spent)
      return
    }
    for (let s = 0; s < rows.length; s++) {
      if (left[s] === 0) continue
      const price = rows[s][left[s] - 1]
      left[s]--
      go(day + 1, spent + price * day)
      left[s]++
    }
  }
  go(1, 0)
  return best
}

test('2931 random shops match the order-search oracle', () => {
  let seed = 2931
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const shops = 1 + rnd(3)
    const width = 1 + rnd(3)
    const rows = Array.from({ length: shops }, () => Array.from({ length: width }, () => 1 + rnd(9)).sort((a, b) => b - a))
    assert.equal(solve(rows), oracle(rows), JSON.stringify(rows))
  }
})
