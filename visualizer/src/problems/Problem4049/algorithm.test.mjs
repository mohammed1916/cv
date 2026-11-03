import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('4049 small cases', () => {
  assert.equal(solve([1, 1, 1]), 1)
  assert.equal(solve([1, 1, 1, 1]), 1)
  assert.equal(solve([2, 2, 2, 2, 2]), 1)
  assert.equal(solve([1, 1, 2, 1, 1, 2, 1, 1]), 0)
  assert.equal(solve([5, 9, 5, 9, 5, 9, 5, 9, 9]), 1)
  assert.equal(solve([3, 7, 3, 7, 3, 7, 3]), 2)
})

test('4049 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace([3, 7, 3, 7, 3, 7, 3])
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4049 rejects bad input', () => {
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('[0,1,2]'))
})

// Independent oracle: compare every pair of occurrences, not only neighbours of the first pair.
function oracle(nums) {
  let count = 0
  for (const v of new Set(nums)) {
    const pos = nums.flatMap((x, i) => (x === v ? [i] : []))
    if (pos.length < 3) continue
    const gaps = []
    for (let a = 0; a < pos.length; a++) for (let b = a + 1; b < pos.length; b++) gaps.push(pos[b] - pos[a])
    const consecutive = pos.slice(1).map((p, t) => p - pos[t])
    const constant = consecutive.every(g => g === consecutive[0])
    if (constant && gaps.length > 0) count += 1
  }
  return count
}

test('4049 random inputs match a direct oracle', () => {
  let seed = 4049
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 3 + rnd(12) }, () => 1 + rnd(3))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
