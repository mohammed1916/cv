import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

const brute = nums => {
  let best = null
  for (let k = 0; k < nums.length - 1; k++) {
    const prefix = nums.slice(0, k + 1).reduce((a, b) => a + b, 0)
    const suffixMin = Math.min(...nums.slice(k + 1))
    const score = prefix - suffixMin
    if (best === null || score > best) best = score
  }
  return best
}

test('3788 official examples', () => {
  assert.equal(solve([10, -1, 3, -4, -5]), 17)
  assert.equal(solve([-7, -5, 3]), -2)
  assert.equal(solve([1, 1]), 0)
})

test('3788 matches brute force on small inputs', () => {
  let seed = 7
  const next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed }
  for (let t = 0; t < 500; t++) {
    const n = 2 + (next() % 7)
    const nums = Array.from({ length: n }, () => (next() % 41) - 20)
    assert.equal(solve(nums), brute(nums), JSON.stringify(nums))
  }
})

test('3788 trace frames carry phase, activeLine, message and pythonLine', () => {
  const { frames } = buildTrace({ nums: [10, -1, 3, -4, -5] })
  for (const f of frames) {
    assert.ok(f.phase && f.message && f.activeLine >= 1 && f.pythonLine >= 1)
  }
})

test('3788 parseInput accepts arrays and rejects bad input', () => {
  assert.deepEqual(parseInput('[1,2]'), { nums: [1, 2] })
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('[1.5,2]'))
})

test('3788 negative values: all-negative input and negative suffix minima', () => {
  assert.equal(solve([-3, -1, -2]), -1)
  const { frames, result } = buildTrace({ nums: [-7, -5, 3] })
  assert.equal(result, -2)
  const first = frames.find(f => f.split === 0 && f.score !== null)
  assert.equal(first.prefix, -7)
  assert.equal(first.sufMin, -5)
  assert.equal(first.score, -2)
})

test('3788 best split is not the last split and the suffix minimum source is tracked', () => {
  const { frames, result } = buildTrace({ nums: [10, -1, 3, -4, -5] })
  assert.equal(result, 17)
  const suffixFrames = frames.filter(f => f.phase === 'suffix')
  assert.deepEqual(suffixFrames.at(-1).sufVal, [-5, -5, -5, -5, -5])
  assert.deepEqual(suffixFrames.at(-1).sufSrc, [4, 4, 4, 4, 4])
  const improvements = frames.filter(f => f.phase === 'improve')
  assert.equal(improvements.at(-1).bestSplit, 2)
  const lastCandidate = frames.find(f => f.phase === 'score' && f.split === 3 && f.ok !== null)
  assert.equal(lastCandidate.score, 13)
  assert.equal(lastCandidate.ok, false)
  assert.equal(lastCandidate.best, 17)
})

test('3788 retained optimum persists to completion, separate from the current candidate', () => {
  const { frames, result } = buildTrace({ nums: [10, -1, 3, -4, -5] })
  const done = frames.at(-1)
  assert.equal(done.phase, 'done')
  assert.equal(done.best, result)
  assert.equal(done.bestSplit, 2)
  assert.equal(done.bestPrefix, 12)
  assert.equal(done.bestSuffixMin, -5)
  assert.equal(done.score, 17)
  // Frames after the optimum was found keep showing it while the candidate changes.
  const afterSplit2 = frames.filter(f => f.phase === 'score' && f.split === 3)
  assert.ok(afterSplit2.every(f => f.best === 17 && f.bestSplit === 2))
})

test('3788 every frame snapshots its suffix row without leaking later values', () => {
  const { frames } = buildTrace({ nums: [4, 2, 9] })
  assert.deepEqual(frames[1].sufVal, [null, null, 9])
  assert.deepEqual(frames[2].sufVal, [null, 2, 9])
  assert.deepEqual(frames.at(-1).sufVal, [2, 2, 9])
  assert.equal(frames.at(-1).bestSplit, 0)
})
