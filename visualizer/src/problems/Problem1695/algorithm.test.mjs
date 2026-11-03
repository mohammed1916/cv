import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: enumerate every contiguous window and keep those with distinct values.
function bruteForce(nums) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    const seen = new Set()
    let sum = 0
    for (let j = i; j < nums.length; j++) {
      if (seen.has(nums[j])) break
      seen.add(nums[j])
      sum += nums[j]
      best = Math.max(best, sum)
    }
  }
  return best
}

function lcg(seed) {
  let state = seed
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state }
}

test('1695 exhaustive arrays over small values match the brute-force oracle', () => {
  const next = lcg(42)
  for (let trial = 0; trial < 3000; trial++) {
    const n = 1 + (next() % 12)
    const nums = Array.from({ length: n }, () => 1 + (next() % 7))
    const run = buildTrace(nums)
    assert.equal(run.result, bruteForce(nums), JSON.stringify(nums))
    assert.equal(run.frames.at(-1).snapshot.best, run.result)
  }
})

test('1695 best never decreases and the window stays unique', () => {
  const nums = [4, 2, 4, 5, 6, 2, 7, 1, 1]
  const run = buildTrace(nums)
  let previous = 0
  for (const frame of run.frames) {
    assert.ok(frame.snapshot.best >= previous)
    previous = frame.snapshot.best
    if (frame.phase === 'inspect') continue // the incoming value is not yet part of the window
    // During a shrink the incoming value at right is not yet in the window.
    const end = frame.phase === 'shrink' ? frame.snapshot.right : frame.snapshot.right + 1
    const window = nums.slice(frame.snapshot.left, Math.max(frame.snapshot.left, end))
    assert.equal(new Set(window).size, window.length, `window at ${frame.phase}`)
    assert.equal(window.reduce((sum, value) => sum + value, 0), frame.snapshot.total)
  }
  assert.equal(run.result, bruteForce(nums))
})

test('1695 duplicates trigger a shrink frame and every phase is used', () => {
  const run = buildTrace([5, 5])
  assert.equal(run.result, 5)
  assert.ok(run.frames.some(frame => frame.phase === 'shrink'))
  const used = new Set(run.frames.map(frame => frame.phase))
  for (const phase of phases) assert.ok(used.has(phase.id), phase.id)
})

test('1695 invalid input is rejected', () => {
  for (const text of ['[]', '[0]', '[1.5]', '"abc"', '[1,"2"]', '{}', '[10001]', 'bad']) {
    assert.throws(() => parseInput(text))
  }
  assert.deepEqual(parseInput('[4, 2, 4]'), [4, 2, 4])
})
