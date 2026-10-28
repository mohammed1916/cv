import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: dynamic programming over children, tracking the total money given out.
// Each child gets 1 to money dollars except 4; the value 8 earns one point.
function oracle({ money, children }) {
  const NEG = -Infinity
  let dp = Array(money + 1).fill(NEG)
  dp[0] = 0
  for (let c = 0; c < children; c++) {
    const next = Array(money + 1).fill(NEG)
    for (let s = 0; s <= money; s++) {
      if (dp[s] === NEG) continue
      for (let v = 1; s + v <= money; v++) {
        if (v === 4) continue
        next[s + v] = Math.max(next[s + v], dp[s] + (v === 8 ? 1 : 0))
      }
    }
    dp = next
  }
  return dp[money] === NEG ? -1 : dp[money]
}

test('2591 examples', () => {
  assert.equal(solve({ money: 20, children: 3 }), 1)
  assert.equal(solve({ money: 16, children: 2 }), 2)
  assert.equal(solve({ money: 8, children: 1 }), 1)
})

test('2591 rejects zero children', () => {
  assert.throws(() => parseInput('{"money":5,"children":0}'))
})

test('2591 random inputs match a dynamic programming oracle', () => {
  let seed = 2591
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { money: rnd(61), children: 1 + rnd(8) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
