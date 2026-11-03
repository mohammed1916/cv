import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (splitTime, strains) => buildTrace({ splitTime, strains }).result

test('3506 worked presets', () => {
  assert.equal(solve(2, [3, 4, 9]), 11)
  assert.equal(solve(5, [7]), 7)
  assert.equal(solve(1, [6, 6, 6, 6]), 8)
})

test('3506 edge cases', () => {
  assert.equal(solve(9, [1]), 1)
  assert.equal(solve(1, [1, 1]), 2)
  assert.equal(solve(9, [9, 9]), 18)
})

test('3506 rejects bad input', () => {
  assert.throws(() => parseInput('{"splitTime":0,"strains":[1]}'))
  assert.throws(() => parseInput('{"splitTime":2,"strains":[]}'))
  assert.throws(() => parseInput('{"splitTime":2,"strains":[10]}'))
})

// Oracle: try every way to split a set of strains between two cells, recursively, with no greedy step.
function oracle(splitTime, strains) {
  const n = strains.length
  const memo = new Map()
  const f = mask => {
    if (memo.has(mask)) return memo.get(mask)
    const bits = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) bits.push(i)
    let best
    if (bits.length === 1) best = strains[bits[0]]
    else {
      best = Infinity
      for (let sub = (mask - 1) & mask; sub > 0; sub = (sub - 1) & mask) {
        const other = mask ^ sub
        best = Math.min(best, splitTime + Math.max(f(sub), f(other)))
      }
    }
    memo.set(mask, best)
    return best
  }
  return f((1 << n) - 1)
}

test('3506 random inputs match a split-partition oracle', () => {
  let seed = 3506
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const splitTime = 1 + rnd(9)
    const strains = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(9))
    assert.equal(solve(splitTime, strains), oracle(splitTime, strains), JSON.stringify({ splitTime, strains }))
  }
})

test('3506 frames keep pseudocode and python line references inside range', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ splitTime: 2, strains: [3, 4, 9] })
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
