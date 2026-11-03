import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (items, capacity) => buildTrace(parseInput(JSON.stringify({ items, capacity }))).result
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`)

function checkFrames(run) {
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

// Independent oracle: a linear program with one bound per item has an optimal vertex with
// at most one fractional item, so enumerate every set of whole items plus one fractional item.
function oracle(items, capacity) {
  const n = items.length
  let best = -Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let weight = 0
    let price = 0
    for (let i = 0; i < n; i++) if (mask & (1 << i)) { weight += items[i][1]; price += items[i][0] }
    if (weight === capacity) best = Math.max(best, price)
    if (weight > capacity) continue
    for (let f = 0; f < n; f++) {
      if (mask & (1 << f)) continue
      const [pf, wf] = items[f]
      if (weight + wf >= capacity) best = Math.max(best, price + (pf * (capacity - weight)) / wf)
    }
  }
  return best === -Infinity ? -1 : best
}

test('2548 local presets are hand-checked', () => {
  // Ratios 7.5, 5, 5, 4: take all 4 of the first (30), 2 of the (10,2) item and 3 of the (50,10) item.
  close(solve([[30, 4], [50, 10], [10, 2], [24, 6]], 9), 55)
  close(solve([[7, 2], [6, 3]], 5), 13)
  assert.equal(solve([[5, 2], [4, 1]], 4), -1)
})

test('2548 a single item may be taken in part', () => {
  close(solve([[9, 4]], 1), 2.25)
})

test('2548 random inputs match the vertex oracle', () => {
  let seed = 2548
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const items = Array.from({ length: n }, () => [1 + rnd(20), 1 + rnd(8)])
    const capacity = 1 + rnd(20)
    const expected = oracle(items, capacity)
    const actual = solve(items, capacity)
    if (expected === -1) assert.equal(actual, -1, JSON.stringify({ items, capacity }))
    else close(actual, expected)
  }
})

test('2548 frame invariants hold', () => {
  checkFrames(buildTrace({ items: [[30, 4], [50, 10], [10, 2], [24, 6]], capacity: 9 }))
  checkFrames(buildTrace({ items: [[5, 2], [4, 1]], capacity: 4 }))
})

test('2548 rejects zero weights', () => {
  assert.throws(() => parseInput('{"items":[[5,0]],"capacity":1}'))
})
