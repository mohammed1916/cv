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
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).best, run.result)
}

test('3934 hand-checked cases', () => {
  assert.equal(solve([1]), 1)
  assert.equal(solve([1, 1]), 2)
  assert.equal(solve([4, 4, 4]), 3)
  assert.equal(solve([1, 2, 1, 2, 3]), 1)
  assert.equal(solve([1, 2, 3]), 1)
})

test('3934 frames are complete for the presets', () => {
  assertFrames(buildTrace({ nums: [1, 2, 1, 2, 3] }))
  assertFrames(buildTrace({ nums: [4, 4, 4] }))
})

test('3934 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,11,12,13]'))
})

// Oracle: for each length, count every window of that length; the first length with exactly one
// occurrence is the answer.
function oracle(nums) {
  const n = nums.length
  for (let len = 1; len <= n; len++) {
    const windows = []
    for (let s = 0; s + len <= n; s++) windows.push(nums.slice(s, s + len).join(','))
    for (let s = 0; s + len <= n; s++) {
      const w = windows[s]
      if (windows.filter(x => x === w).length === 1) return len
    }
  }
  return n
}

test('3934 random arrays match the window-counting oracle', () => {
  let seed = 3934
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(3))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
