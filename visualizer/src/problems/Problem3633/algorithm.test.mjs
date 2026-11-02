import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (landStartTime, landDuration, waterStartTime, waterDuration) =>
  buildTrace({ landStartTime, landDuration, waterStartTime, waterDuration }).result

test('3633 worked examples', () => {
  assert.equal(solve([2, 8], [4, 1], [6], [3]), 9)
  assert.equal(solve([5], [3], [1], [10]), 14)
})

test('3633 single ride of each kind', () => {
  assert.equal(solve([1], [1], [1], [1]), 3)
  assert.equal(solve([10], [5], [1], [2]), 15)
})

test('3633 rejects mismatched or out-of-range lists', () => {
  assert.throws(() => parseInput('{"landStartTime":[1],"landDuration":[1,2],"waterStartTime":[1],"waterDuration":[1]}'))
  assert.throws(() => parseInput('{"landStartTime":[0],"landDuration":[1],"waterStartTime":[1],"waterDuration":[1]}'))
})

// Independent oracle: simulate both rides in each order with waiting, over every pair.
function oracle(ls, ld, ws, wd) {
  let best = Infinity
  for (let i = 0; i < ls.length; i++) {
    for (let j = 0; j < ws.length; j++) {
      for (const order of [[0, 1], [1, 0]]) {
        let time = 0
        for (const ride of order) {
          const start = ride === 0 ? ls[i] : ws[j]
          const dur = ride === 0 ? ld[i] : wd[j]
          time = Math.max(time, start) + dur
        }
        best = Math.min(best, time)
      }
    }
  }
  return best
}

test('3633 random inputs match a simulation oracle', () => {
  let seed = 3633
  const next = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return 1 + (seed % n) }
  for (let t = 0; t < 300; t++) {
    const pick = () => Array.from({ length: next(4) }, () => next(30))
    const ls = pick(), ld = ls.map(() => next(10)), ws = pick(), wd = ws.map(() => next(10))
    assert.equal(solve(ls, ld, ws, wd), oracle(ls, ld, ws, wd))
  }
})
