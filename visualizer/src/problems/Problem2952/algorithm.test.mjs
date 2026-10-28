import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2952 official examples', () => {
  assert.equal(solve({ coins: [1, 4, 10], target: 19 }), 2)
  assert.equal(solve({ coins: [1, 1, 1], target: 20 }), 3)
  assert.equal(solve({ coins: [1, 4, 10, 5, 7, 19], target: 19 }), 1)
})

test('2952 an empty gap at the start needs a coin of value one', () => {
  assert.equal(solve({ coins: [2], target: 1 }), 1)
})

test('2952 rejects a zero target', () => {
  assert.throws(() => parseInput(JSON.stringify({ coins: [1], target: 0 })))
})

// Independent oracle: try every multiset of added coins, smallest size first, and test all sums by subset-sum DP.
function reachesAll(coins, target) {
  const ok = new Array(target + 1).fill(false)
  ok[0] = true
  for (const c of coins) {
    if (c > target) continue
    for (let s = target; s >= c; s--) if (ok[s - c]) ok[s] = true
  }
  for (let s = 1; s <= target; s++) if (!ok[s]) return false
  return true
}

function oracle({ coins, target }) {
  for (let count = 0; ; count++) {
    const pick = (start, left, chosen) => {
      if (left === 0) return reachesAll([...coins, ...chosen], target)
      for (let v = start; v <= target; v++) {
        if (pick(v, left - 1, [...chosen, v])) return true
      }
      return false
    }
    if (pick(1, count, [])) return count
  }
}

test('2952 random inputs match a brute-force coin-multiset oracle', () => {
  let seed = 2952
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = {
      coins: Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(12)),
      target: 1 + rnd(12),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
