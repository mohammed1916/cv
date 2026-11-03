import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (items, w1, w2) => buildTrace({ items, w1, w2 }).result

test('3647 hand-checked values', () => {
  assert.equal(solve([4, 3, 2], 5, 4), 9)
  assert.equal(solve([1, 2, 3], 0, 0), 0)
  assert.equal(solve([5, 5, 5], 5, 5), 10)
  assert.equal(solve([6], 5, 5), 0)
})

test('3647 capacities are separate', () => {
  assert.equal(solve([3, 3], 3, 0), 3)
  assert.equal(solve([3, 3], 3, 3), 6)
})

test('3647 rejects bad input', () => {
  assert.throws(() => parseInput('{"items":[],"w1":1,"w2":1}'))
  assert.throws(() => parseInput('{"items":[10],"w1":1,"w2":1}'))
  assert.throws(() => parseInput('{"items":[1],"w1":13,"w2":1}'))
})

test('3647 frames carry valid lines and phases', () => {
  const trace = buildTrace({ items: [4, 3], w1: 5, w2: 4 })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(phaseIds.has(frame.phase))
    assert.equal(frame.reach.length, 6)
  }
})

// Oracle: try all 3^n assignments of items to bag 1, bag 2 or unused.
function oracle(items, w1, w2) {
  let best = -1
  const n = items.length
  const total = 3 ** n
  for (let mask = 0; mask < total; mask++) {
    let m = mask, l1 = 0, l2 = 0
    for (let i = 0; i < n; i++, m = Math.floor(m / 3)) {
      const d = m % 3
      if (d === 1) l1 += items[i]
      if (d === 2) l2 += items[i]
    }
    if (l1 <= w1 && l2 <= w2) best = Math.max(best, l1 + l2)
  }
  return best
}

test('3647 random inputs match an assignment oracle', () => {
  let seed = 3647
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const items = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(6))
    const w1 = rnd(9), w2 = rnd(9)
    assert.equal(solve(items, w1, w2), oracle(items, w1, w2), JSON.stringify({ items, w1, w2 }))
  }
})
