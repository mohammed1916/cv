import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
    assert.equal(f.dp.length, run.input.nums.length + 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('3920 hand-checked cases', () => {
  assert.equal(solve([0]), 1)
  assert.equal(solve([1]), 0)
  assert.equal(solve([0, 1, 2]), 3)
  assert.equal(solve([3, 0, 1]), 2)
  assert.equal(solve([2, 2]), 0)
  assert.equal(solve([1, 1]), 1)
})

test('3920 frames are complete for the presets', () => {
  assertFrames(buildTrace({ nums: [3, 0, 4, 1] }))
  assertFrames(buildTrace({ nums: [5, 2, 6, 2, 1] }))
})

test('3920 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[13]'))
  assert.throws(() => parseInput('[-1]'))
})

// Oracle: try every subset of survivors.
function oracle(nums) {
  const n = nums.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const survivors = nums.filter((_, i) => mask & (1 << i))
    const fixed = survivors.filter((v, i) => v === i).length
    best = Math.max(best, fixed)
  }
  return best
}

test('3920 random arrays match subset enumeration', () => {
  let seed = 3920
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(10))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
