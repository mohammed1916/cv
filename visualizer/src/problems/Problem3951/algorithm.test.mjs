import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (bulbs, brightness, intervals) => buildTrace({ bulbs, brightness, intervals }).result

// Independent oracle: for each covered time, try every set of bulbs and keep the smallest that lights enough positions.
function oracle(bulbs, brightness, intervals) {
  const times = new Set()
  for (const [s, e] of intervals) for (let t = s; t <= e; t++) times.add(t)
  let perTime = Infinity
  for (let mask = 1; mask < 1 << bulbs; mask++) {
    const lit = new Set()
    let count = 0
    for (let b = 0; b < bulbs; b++) if (mask >> b & 1) {
      count++
      for (const p of [b - 1, b, b + 1]) if (p >= 0 && p < bulbs) lit.add(p)
    }
    if (lit.size >= brightness) perTime = Math.min(perTime, count)
  }
  return perTime * times.size
}

test('3951 authored presets', () => {
  assert.equal(solve(6, 3, [[0, 2], [5, 6]]), 5)
  assert.equal(solve(8, 5, [[1, 4], [3, 6], [10, 10]]), 2 * 7)
})

test('3951 a single time unit with full brightness', () => {
  assert.equal(solve(4, 4, [[7, 7]]), 2)
  assert.equal(solve(1, 1, [[0, 0]]), 1)
})

test('3951 rejects bad input', () => {
  assert.throws(() => parseInput('{"bulbs":3,"brightness":4,"intervals":[[0,1]]}'))
  assert.throws(() => parseInput('{"bulbs":3,"brightness":2,"intervals":[[2,1]]}'))
})

test('3951 small random cases match the per-time oracle', () => {
  let seed = 3951
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const bulbs = 1 + rnd(6)
    const brightness = 1 + rnd(bulbs)
    const intervals = Array.from({ length: 1 + rnd(4) }, () => { const s = rnd(12); return [s, s + rnd(5)] })
    assert.equal(solve(bulbs, brightness, intervals), oracle(bulbs, brightness, intervals), JSON.stringify({ bulbs, brightness, intervals }))
  }
})
