import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (weights, k) => buildTrace(parseInput(JSON.stringify({ weights, k }))).result

test('2551 official examples', () => {
  assert.equal(solve([1, 3, 5, 1], 2), 4)
  assert.equal(solve([1, 3], 2), 0)
})

test('2551 one bag always scores zero', () => {
  assert.equal(solve([7, 2, 9], 1), 0)
})

test('2551 rejects k larger than the number of marbles', () => {
  assert.throws(() => parseInput('{"weights":[1,2],"k":3}'))
})

// Independent oracle: try every choice of k-1 cut positions and score each split directly.
function oracle(weights, k) {
  const n = weights.length
  const cuts = []
  let best = -Infinity
  let worst = Infinity
  const choose = (start, chosen) => {
    if (chosen.length === k - 1) {
      const bounds = [0, ...chosen.map(c => c + 1), n]
      let score = 0
      for (let b = 0; b + 1 < bounds.length; b++) {
        const first = bounds[b]
        const last = bounds[b + 1] - 1
        score += weights[first] + weights[last]
      }
      best = Math.max(best, score)
      worst = Math.min(worst, score)
      return
    }
    for (let c = start; c < n - 1; c++) choose(c + 1, [...chosen, c])
  }
  choose(0, cuts)
  return best - worst
}

test('2551 random bags match a cut-enumeration oracle', () => {
  let seed = 2551
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const weights = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(100))
    const k = 1 + rnd(weights.length)
    assert.equal(solve(weights, k), oracle(weights, k), JSON.stringify({ weights, k }))
  }
})
