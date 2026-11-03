import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (period, green, arrivals) => buildTrace({ period, green, arrivals }).result

test('4025 small hand cases', () => {
  assert.equal(solve(10, [3, 6], [2, 8, 15]), 2)
  assert.equal(solve(10, [3], [5]), 5)
  assert.equal(solve(10, [9], [9]), 1)
  assert.equal(solve(7, [1], [7, 14]), 0)
})

test('4025 rejects a green time outside 1..period-1', () => {
  assert.throws(() => parseInput('{"period":5,"green":[5],"arrivals":[1]}'))
  assert.throws(() => parseInput('{"period":5,"green":[0],"arrivals":[1]}'))
})

// Brute oracle: try every assignment of cars to lights and keep the best largest wait.
function brute(period, green, arrivals) {
  let best = Infinity
  const waitOn = (time, g) => {
    const r = time % period
    return r < g ? 0 : period - r
  }
  const rec = (index, worst) => {
    if (index === arrivals.length) {
      best = Math.min(best, worst)
      return
    }
    for (const g of green) rec(index + 1, Math.max(worst, waitOn(arrivals[index], g)))
  }
  rec(0, 0)
  return best
}

test('4025 matches an assignment enumeration', () => {
  let seed = 4025
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const period = 2 + rnd(12)
    const green = Array.from({ length: 1 + rnd(3) }, () => 1 + rnd(period - 1))
    const arrivals = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(60))
    assert.equal(solve(period, green, arrivals), brute(period, green, arrivals), JSON.stringify({ period, green, arrivals }))
  }
})

test('4025 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ period: 10, green: [3, 6], arrivals: [2, 8, 15] })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
})
