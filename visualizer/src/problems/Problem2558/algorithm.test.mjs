import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2558 official examples', () => {
  assert.equal(solve({ gifts: [25, 64, 9, 4, 100], k: 4 }), 29)
  assert.equal(solve({ gifts: [1, 1, 1, 1], k: 4 }), 4)
})

test('2558 a pile of one stays at one', () => {
  // 50 goes to 7, then 2, then 1; after that both piles stay at 1.
  assert.equal(solve({ gifts: [1, 50], k: 8 }), 2)
})

test('2558 rejects an empty pile list and k of zero', () => {
  assert.throws(() => parseInput('{"gifts":[],"k":1}'))
  assert.throws(() => parseInput('{"gifts":[4],"k":0}'))
})

// Independent oracle: find the integer square root by counting up, and pick the richest pile by a sorted copy.
function intSqrt(x) {
  let r = 0
  while ((r + 1) * (r + 1) <= x) r++
  return r
}

function oracle({ gifts, k }) {
  let piles = [...gifts]
  for (let s = 0; s < k; s++) {
    const sorted = [...piles].sort((a, b) => b - a)
    const top = sorted[0]
    piles.splice(piles.indexOf(top), 1)
    piles.push(intSqrt(top))
  }
  return piles.reduce((a, b) => a + b, 0)
}

test('2558 random inputs match a counting-square-root oracle', () => {
  let seed = 2558
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { gifts: Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(50)), k: 1 + rnd(8) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
