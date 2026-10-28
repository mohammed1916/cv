import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3147 examples', () => {
  assert.equal(solve({ energy: [5, 2, -10, -5, 1], k: 3 }), 3)
  assert.equal(solve({ energy: [-2, -3, -1], k: 2 }), -1)
})

test('3147 a single wizard collects its own energy', () => {
  assert.equal(solve({ energy: [-4], k: 1 }), -4)
})

test('3147 rejects k of zero or larger than the list', () => {
  assert.throws(() => parseInput('{"energy":[1,2],"k":0}'))
  assert.throws(() => parseInput('{"energy":[1,2],"k":3}'))
})

// Independent oracle: simulate every starting wizard directly.
function oracle({ energy, k }) {
  let best = -Infinity
  for (let start = 0; start < energy.length; start++) {
    let sum = 0
    for (let i = start; i < energy.length; i += k) sum += energy[i]
    best = Math.max(best, sum)
  }
  return best
}

test('3147 random inputs match a direct-simulation oracle', () => {
  let seed = 3147
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const input = { energy: Array.from({ length: n }, () => rnd(21) - 10), k: 1 + rnd(n) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
