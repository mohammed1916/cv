import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3100 official examples', () => {
  assert.equal(solve('{"numBottles":13,"numExchange":6}'), 15)
  assert.equal(solve('{"numBottles":10,"numExchange":3}'), 13)
})

test('3100 rejects an exchange count of zero', () => {
  assert.throws(() => parseInput('{"numBottles":5,"numExchange":0}'))
})

// Independent oracle: drink one bottle at a time and exchange the moment the empties reach the current cost.
function oracle({ numBottles, numExchange }) {
  let full = numBottles
  let empty = 0
  let cost = numExchange
  let drunk = 0
  while (full > 0) {
    full -= 1
    drunk += 1
    empty += 1
    if (empty === cost) {
      empty -= cost
      cost += 1
      full += 1
    }
  }
  return drunk
}

test('3100 seeded random cases match a one-bottle-at-a-time oracle', () => {
  let seed = 3100
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { numBottles: 1 + rnd(60), numExchange: 1 + rnd(20) }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
