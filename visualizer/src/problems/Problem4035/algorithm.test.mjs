import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('4035 two elements and one element after removal', () => {
  assert.equal(solve([4, 4]), 1)
  assert.equal(solve([4, 6]), 0)
  assert.equal(solve([2, 4, 8, 3, 6]), 2)
  assert.equal(solve([6, 12, 18, 4, 8]), 0)
})

test('4035 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace([2, 4, 8, 3, 6])
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4035 rejects bad input', () => {
  assert.throws(() => parseInput('[5]'))
  assert.throws(() => parseInput('[0,1]'))
})

// Independent oracle: enumerate removals by index and test each split with a pairwise gcd fold.
function oracle(nums) {
  const g = (a, b) => (b === 0 ? a : g(b, a % b))
  const gcdAll = arr => arr.reduce((x, y) => g(x, y))
  let best = 0
  const candidates = [nums, ...nums.map((_, i) => nums.filter((__, j) => j !== i))]
  for (const arr of candidates) {
    let count = 0
    for (let i = 1; i < arr.length; i++) {
      if (gcdAll(arr.slice(0, i)) === gcdAll(arr.slice(i))) count += 1
    }
    best = Math.max(best, count)
  }
  return best
}

test('4035 random inputs match an independent oracle', () => {
  let seed = 4035
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(7) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
