import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1599 official examples', () => {
  assert.equal(solve('{"customers":[8,3],"boardingCost":5,"runningCost":6}'), 3)
  assert.equal(solve('{"customers":[10,9,6],"boardingCost":6,"runningCost":4}'), 7)
  assert.equal(solve('{"customers":[3,4,0,5,1],"boardingCost":1,"runningCost":92}'), -1)
})

test('1599 rejects a negative group size', () => {
  assert.throws(() => parseInput('{"customers":[-1],"boardingCost":1,"runningCost":1}'))
})

// Independent oracle: boarded(r) = min(arrived(r), boarded(r-1) + 4) gives the boarded total after r rotations directly.
function oracle({ customers, boardingCost, runningCost }) {
  const total = customers.reduce((a, b) => a + b, 0)
  const limit = customers.length + Math.ceil(total / 4) + 2
  let boarded = 0
  let bestProfit = 0
  let bestRotation = -1
  for (let r = 1; r <= limit; r++) {
    const arrived = customers.slice(0, Math.min(r, customers.length)).reduce((a, b) => a + b, 0)
    boarded = Math.min(arrived, boarded + 4)
    const profit = boarded * boardingCost - r * runningCost
    if (profit > bestProfit) {
      bestProfit = profit
      bestRotation = r
    }
  }
  return bestRotation
}

test('1599 seeded random cases match a cumulative-boarding oracle', () => {
  let seed = 1599
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = {
      customers: Array.from({ length: 1 + rnd(12) }, () => rnd(51)),
      boardingCost: rnd(101),
      runningCost: rnd(101),
    }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
