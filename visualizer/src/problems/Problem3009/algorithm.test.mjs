import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = y => buildTrace(parseInput(JSON.stringify(y))).result

// Independent oracle: sample horizontal lines on a half-unit grid and collect the exact crossing x-coordinates.
function oracle(y) {
  let best = 0
  const lo = Math.min(...y) - 1
  const hi = Math.max(...y) + 1
  for (let h = lo; h <= hi; h += 0.5) {
    const xs = []
    for (let i = 0; i < y.length; i++) if (y[i] === h) xs.push(i)
    for (let i = 0; i + 1 < y.length; i++) {
      const a = y[i]
      const b = y[i + 1]
      if (Math.min(a, b) < h && h < Math.max(a, b)) xs.push(i + (h - a) / (b - a))
    }
    const distinct = []
    for (const x of xs) if (!distinct.some(d => Math.abs(d - x) < 1e-9)) distinct.push(x)
    best = Math.max(best, distinct.length)
  }
  return best
}

test('3009 worked presets', () => {
  assert.equal(solve([7, 4]), 1)
  assert.equal(solve([2, 5, 1, 4, 3]), 4)
  assert.equal(solve([1, 6, 2, 6, 1]), 4)
})

test('3009 a vertex shared by two segments counts once', () => {
  // The line at height 3 touches only the middle point, which both segments share: one hit, not two.
  assert.equal(solve([2, 3, 4]), 1)
  assert.equal(solve([4, 3, 2]), 1)
  assert.equal(solve([1, 3, 2]), 2)
})

test('3009 rejects inputs the statement rules out', () => {
  assert.throws(() => parseInput('[4]'))
  assert.throws(() => parseInput('[4,4,5]'))
  assert.throws(() => parseInput('[1,-2]'))
  assert.throws(() => parseInput('[1,2.5]'))
})

test('3009 matches the sampling oracle on random zigzags', () => {
  let seed = 11
  const rand = k => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed % k
  }
  for (let trial = 0; trial < 300; trial++) {
    const n = 2 + rand(8)
    const y = [rand(10)]
    while (y.length < n) {
      const next = rand(10)
      if (next !== y.at(-1)) y.push(next)
    }
    assert.equal(solve(y), oracle(y), JSON.stringify(y))
  }
})

test('3009 frames stay inside the pseudocode and python ranges', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace([2, 5, 1, 4, 3])
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).best, run.result)
})
