import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2279 official examples', () => {
  assert.equal(solve({ capacity: [2, 3, 4, 5], rocks: [1, 2, 4, 4], additional_rocks: 2 }), 3)
  assert.equal(solve({ capacity: [10, 2, 2], rocks: [2, 2, 0], additional_rocks: 100 }), 3)
})

test('2279 a bag that is already full needs no rocks', () => {
  assert.equal(solve({ capacity: [4, 4], rocks: [4, 0], additional_rocks: 0 }), 1)
})

test('2279 rejects more rocks than capacity', () => {
  assert.throws(() => parseInput('{"capacity":[2],"rocks":[3],"additional_rocks":0}'))
})

// Independent oracle: try every subset of bags and keep the largest one whose total need fits in the extra rocks.
function oracle({ capacity, rocks, additional_rocks }) {
  const need = capacity.map((c, i) => c - rocks[i])
  let best = 0
  for (let mask = 0; mask < 1 << need.length; mask++) {
    let total = 0
    let size = 0
    for (let i = 0; i < need.length; i++) {
      if (mask & (1 << i)) { total += need[i]; size++ }
    }
    if (total <= additional_rocks && size > best) best = size
  }
  return best
}

test('2279 random bags match a subset oracle', () => {
  let seed = 2279
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const capacity = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(10))
    const input = { capacity, rocks: capacity.map(c => rnd(c + 1)), additional_rocks: rnd(20) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
