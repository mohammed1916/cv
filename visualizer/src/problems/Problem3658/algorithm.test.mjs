import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('3658 official examples', () => {
  assert.equal(buildTrace({ n: 4 }).result, 4)
  assert.equal(buildTrace({ n: 1 }).result, 1)
})

test('3658 rejects n outside the visualization range', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":41}'))
})

// Independent oracle: build the odd and even numbers as lists, sum them, and use Euclid's algorithm.
function oracle(n) {
  const odds = Array.from({ length: n }, (_, k) => 2 * (k + 1) - 1)
  const evens = Array.from({ length: n }, (_, k) => 2 * (k + 1))
  let a = odds.reduce((s, v) => s + v, 0)
  let b = evens.reduce((s, v) => s + v, 0)
  while (b) [a, b] = [b, a % b]
  return a
}

test('3658 every n matches a list-summing oracle', () => {
  for (let n = 1; n <= 40; n++) assert.equal(buildTrace({ n }).result, oracle(n), `n=${n}`)
})
