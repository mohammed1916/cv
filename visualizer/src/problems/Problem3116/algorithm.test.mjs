import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: list every amount up to the bound that some single coin divides, sort, and take the k-th.
function oracle({ coins, k }) {
  const amounts = []
  for (let x = 1; amounts.length < k || x <= Math.min(...coins) * k; x++) {
    if (coins.some(c => x % c === 0)) amounts.push(x)
    if (amounts.length >= k) break
  }
  return amounts.sort((a, b) => a - b)[k - 1]
}

test('3116 official examples', () => {
  assert.equal(solve({ coins: [3, 6, 9], k: 3 }), 9)
  assert.equal(solve({ coins: [5, 2], k: 7 }), 12)
})

test('3116 a single coin and a duplicate coin', () => {
  assert.equal(solve({ coins: [4], k: 5 }), 20)
  assert.equal(solve({ coins: [2, 2], k: 3 }), 6)
})

test('3116 rejects bad input', () => {
  assert.throws(() => parseInput('{"coins":[],"k":1}'))
  assert.throws(() => parseInput('{"coins":[26],"k":1}'))
  assert.throws(() => parseInput('{"coins":[2],"k":0}'))
})

test('3116 random coins match a sorted-list oracle', () => {
  let seed = 3116
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const coins = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(25))
    const k = 1 + rnd(30)
    assert.equal(solve({ coins, k }), oracle({ coins, k }), JSON.stringify({ coins, k }))
  }
})
