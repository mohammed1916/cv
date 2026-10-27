import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2594 official examples', () => {
  assert.equal(solve({ ranks: [4, 2, 3, 1], cars: 10 }), 16)
  assert.equal(solve({ ranks: [5, 1, 8], cars: 6 }), 16)
})

test('2594 rejects a rank of zero', () => {
  assert.throws(() => parseInput('{"ranks":[0,2],"cars":3}'))
})

// Independent oracle: give each next car to the mechanic who would finish it soonest.
function oracle({ ranks, cars }) {
  const done = ranks.map(() => 0)
  for (let car = 0; car < cars; car++) {
    let pick = 0
    for (let j = 1; j < ranks.length; j++) {
      if (ranks[j] * (done[j] + 1) ** 2 < ranks[pick] * (done[pick] + 1) ** 2) pick = j
    }
    done[pick]++
  }
  return Math.max(...ranks.map((rank, j) => rank * done[j] ** 2))
}

test('2594 seeded random cases match greedy assignment', () => {
  let seed = 2594
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { ranks: Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(8)), cars: 1 + rnd(10) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
