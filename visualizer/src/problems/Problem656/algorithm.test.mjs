import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (coins, maxJump) => buildTrace({ coins, maxJump }).result

test('656 official examples', () => {
  assert.deepEqual(solve([1, 2, 4, -1, 2], 2), [1, 3, 5])
  assert.deepEqual(solve([1, 2, 4, -1, 2], 1), [])
})

test('656 rejects a maxJump of zero', () => {
  assert.throws(() => parseInput('{"coins":[1,2],"maxJump":0}'))
})

// Independent oracle: enumerate every legal path, keep the cheapest, and break ties by the smallest index sequence.
function oracle(coins, maxJump) {
  const n = coins.length
  const lexLess = (a, b) => {
    for (let k = 0; k < Math.min(a.length, b.length); k++) if (a[k] !== b[k]) return a[k] < b[k]
    return a.length < b.length
  }
  let best = null
  const walk = (path, cost) => {
    const i = path.at(-1)
    if (i === n - 1) {
      const candidate = path.map(x => x + 1)
      if (!best || cost < best.cost || (cost === best.cost && lexLess(candidate, best.path))) best = { cost, path: candidate }
      return
    }
    for (let j = i + 1; j <= Math.min(n - 1, i + maxJump); j++) {
      if (coins[j] !== -1) walk([...path, j], cost + coins[j])
    }
  }
  if (coins[0] !== -1) walk([0], coins[0])
  return best ? best.path : []
}

test('656 random small arrays match exhaustive search', () => {
  let seed = 41
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 400; t++) {
    const coins = Array.from({ length: 1 + rnd(8) }, () => (rnd(5) === 0 ? -1 : rnd(10)))
    const maxJump = 1 + rnd(4)
    assert.deepEqual(solve(coins, maxJump), oracle(coins, maxJump), JSON.stringify({ coins, maxJump }))
  }
})
