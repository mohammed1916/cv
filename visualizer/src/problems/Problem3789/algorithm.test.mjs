import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (cost1, cost2, costBoth, need1, need2) => buildTrace({ cost1, cost2, costBoth, need1, need2 }).result

test('3789 official examples', () => {
  assert.equal(solve(3, 2, 1, 3, 2), 3)
  assert.equal(solve(5, 4, 15, 2, 3), 22)
  assert.equal(solve(5, 4, 15, 0, 0), 0)
})

test('3789 every frame names a python line and a message', () => {
  const { frames } = buildTrace({ cost1: 3, cost2: 2, costBoth: 1, need1: 3, need2: 2 })
  for (const frame of frames) {
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 2 && frame.pythonLine <= 9)
    assert.ok(typeof frame.phase === 'string' && typeof frame.activeLine === 'number' && frame.message.length > 0)
  }
})

test('3789 rejects out-of-range or non-integer values', () => {
  assert.throws(() => parseInput('{"cost1":0,"cost2":2,"costBoth":1,"need1":3,"need2":2}'))
  assert.throws(() => parseInput('{"cost1":3,"cost2":2,"costBoth":1,"need1":1.5,"need2":2}'))
  assert.throws(() => parseInput('{"cost1":3,"cost2":2,"costBoth":1,"need1":1000000001,"need2":2}'))
})

// Independent oracle: try every count of each unit type for small needs.
function oracle(cost1, cost2, costBoth, need1, need2) {
  let best = Infinity
  for (let a = 0; a <= need1; a++) {
    for (let b = 0; b <= need2; b++) {
      for (let c = 0; c <= Math.max(need1, need2); c++) {
        if (a + c >= need1 && b + c >= need2) best = Math.min(best, a * cost1 + b * cost2 + c * costBoth)
      }
    }
  }
  return best
}

test('3789 random small inputs match a brute-force oracle', () => {
  let seed = 3789
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const cost1 = 1 + rnd(12), cost2 = 1 + rnd(12), costBoth = 1 + rnd(30)
    const need1 = rnd(7), need2 = rnd(7)
    assert.equal(solve(cost1, cost2, costBoth, need1, need2), oracle(cost1, cost2, costBoth, need1, need2),
      JSON.stringify({ cost1, cost2, costBoth, need1, need2 }))
  }
})
