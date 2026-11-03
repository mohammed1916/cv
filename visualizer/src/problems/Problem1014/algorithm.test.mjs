import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = values => buildTrace({ values }).result

test('1014 two spots score their values minus the distance', () => {
  assert.equal(solve([3, 8]), 10)
  assert.equal(solve([7, 7, 7, 7, 7]), 13)
})

test('1014 a large early value stays useful for later spots', () => {
  assert.equal(solve([30, 2, 3, 4, 5, 6]), 31)
})

test('1014 rejects a single spot', () => {
  assert.throws(() => parseInput('{"values":[5]}'), /values is a list/)
})

// Independent oracle: score every pair i < j.
function oracle(values) {
  let best = -Infinity
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) best = Math.max(best, values[i] + values[j] + i - j)
  }
  return best
}

test('1014 random lists match a pairwise oracle', () => {
  let seed = 1014
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(11)
    const values = Array.from({ length: len }, () => 1 + rnd(1000))
    const input = JSON.stringify({ values })
    parseInput(input)
    assert.equal(solve(values), oracle(values), input)
  }
})
