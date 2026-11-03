import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (factors, prices, budget) => buildTrace({ factors, prices, budget }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
    assert.equal(f.row.length, run.input.budget + 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('3946 hand-checked cases', () => {
  assert.equal(solve([1, 2], [1, 1], 2), 3)
  assert.equal(solve([1], [2], 1), 0)
  assert.equal(solve([1], [2], 4), 2)
})

test('3946 frames are complete for the presets', () => {
  assertFrames(buildTrace({ factors: [2, 4, 3, 8], prices: [3, 5, 2, 4], budget: 12 }))
  assertFrames(buildTrace({ factors: [1, 6, 2], prices: [4, 1, 3], budget: 7 }))
})

test('3946 rejects bad input', () => {
  assert.throws(() => parseInput('{"factors":[1],"prices":[1,2],"budget":3}'))
  assert.throws(() => parseInput('{"factors":[1],"prices":[1],"budget":0}'))
  assert.throws(() => parseInput('{"factors":[31],"prices":[1],"budget":3}'))
})

// Oracle: enumerate how many copies of each type are bought, then count grants directly.
function oracle(factors, prices, budget) {
  const n = factors.length
  let best = 0
  const counts = Array(n).fill(0)
  const search = (i, spent) => {
    if (i === n) {
      let total = 0
      for (let t = 0; t < n; t++) {
        if (counts[t] === 0) continue
        total += counts[t]
        for (let j = 0; j < n; j++) if (j !== t && factors[j] % factors[t] === 0) total += 1
      }
      best = Math.max(best, total)
      return
    }
    for (let c = 0; spent + c * prices[i] <= budget; c++) {
      counts[i] = c
      search(i + 1, spent + c * prices[i])
    }
    counts[i] = 0
  }
  search(0, 0)
  return best
}

test('3946 random small inputs match copy-count enumeration', () => {
  let seed = 3946
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(4)
    const factors = Array.from({ length: n }, () => 1 + rnd(8))
    const prices = Array.from({ length: n }, () => 1 + rnd(6))
    const budget = 1 + rnd(14)
    assert.equal(solve(factors, prices, budget), oracle(factors, prices, budget), JSON.stringify({ factors, prices, budget }))
  }
})
