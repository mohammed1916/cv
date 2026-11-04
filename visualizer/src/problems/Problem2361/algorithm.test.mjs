import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (regular, express, expressCost) => buildTrace({ regular, express, expressCost }).result

test('2361 worked examples', () => {
  assert.deepEqual(solve([4, 2, 8, 3], [1, 6, 2, 9], 5), [4, 6, 13, 16])
  assert.deepEqual(solve([3, 9, 2], [8, 1, 4], 2), [3, 6, 8])
})

test('2361 single stop takes the cheaper line from regular at stop zero', () => {
  assert.deepEqual(solve([7], [3], 1), [4])
  assert.deepEqual(solve([2], [9], 5), [2])
})

test('2361 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace({ regular: [1, 6], express: [5, 2], expressCost: 8 })
  const lines = run.frames.length
  assert.ok(lines > 0)
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 10)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 10)
    assert.equal(typeof frame.message, 'string')
  }
})

test('2361 rejects malformed input', () => {
  assert.throws(() => parseInput('{"regular":[1],"express":[1,2],"expressCost":1}'))
  assert.throws(() => parseInput('{"regular":[1],"express":[1],"expressCost":0}'))
})

// Oracle: enumerate every line choice per stop and price the switches directly.
function oracle(regular, express, expressCost) {
  const n = regular.length
  const out = []
  for (let last = 0; last < n; last++) {
    let best = Infinity
    for (let mask = 0; mask < 1 << (last + 1); mask++) {
      let cost = 0
      let line = 0 // 0 regular, 1 express
      for (let i = 0; i <= last; i++) {
        const want = (mask >> i) & 1
        if (line === 0 && want === 1) cost += expressCost
        line = want
        cost += want ? express[i] : regular[i]
      }
      best = Math.min(best, cost)
    }
    out.push(best)
  }
  return out
}

test('2361 random inputs match an enumeration oracle', () => {
  let seed = 2361
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(7)
    const regular = Array.from({ length: n }, () => 1 + rnd(20))
    const express = Array.from({ length: n }, () => 1 + rnd(20))
    const expressCost = 1 + rnd(20)
    assert.deepEqual(solve(regular, express, expressCost), oracle(regular, express, expressCost), JSON.stringify({ regular, express, expressCost }))
  }
})
