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
    assert.equal(f.answer.length, run.input.nums.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).answer, run.result)
}

test('3917 hand-checked small arrays', () => {
  assert.deepEqual(solve([1]), [0])
  assert.deepEqual(solve([2, 4, 6]), [0, 0, 0])
  assert.deepEqual(solve([1, 2, 3]), [1, 1, 0])
  assert.deepEqual(solve([5, 2, 8]), [2, 0, 0])
})

test('3917 frames are complete for the presets', () => {
  assertFrames(buildTrace({ nums: [4, 7, 2, 9, 6] }))
  assertFrames(buildTrace({ nums: [5, 2, 8] }))
})

test('3917 rejects out-of-range input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1.5]'))
})

function oracle(nums) {
  return nums.map((_, i) => nums.slice(i + 1).filter(v => (v + nums[i]) % 2 === 1).length)
}

test('3917 random arrays match a brute-force oracle', () => {
  let seed = 3917
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(100))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
