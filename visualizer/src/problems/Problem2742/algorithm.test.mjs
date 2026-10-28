import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2742 official examples', () => {
  assert.equal(solve({ cost: [1, 2, 3, 2], time: [1, 2, 3, 2] }), 3)
  assert.equal(solve({ cost: [2, 3, 4, 2], time: [1, 1, 1, 1] }), 4)
})

test('2742 a single wall must be painted by the paid painter', () => {
  assert.equal(solve({ cost: [7], time: [1] }), 7)
})

test('2742 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"cost":[1,2],"time":[1]}'))
})

// Independent oracle: the free painter can paint one wall per unit of paid time, so a set S of paid walls works
// when the walls outside S fit into the time the paid painter spends on S.
function oracle({ cost, time }) {
  const n = cost.length
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let paid = 0
    let spent = 0
    let count = 0
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) {
        paid += cost[i]
        spent += time[i]
        count++
      }
    }
    if (n - count <= spent) best = Math.min(best, paid)
  }
  return best
}

test('2742 random inputs match a subset oracle', () => {
  let seed = 2742
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const cost = Array.from({ length: n }, () => 1 + rnd(20))
    const time = Array.from({ length: n }, () => 1 + rnd(4))
    assert.equal(solve({ cost, time }), oracle({ cost, time }), JSON.stringify({ cost, time }))
  }
})
