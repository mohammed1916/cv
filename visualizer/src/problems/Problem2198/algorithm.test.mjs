import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2198 hand-checked triples', () => {
  // [3, 4, 6, 9, 10]: exactly one unordered index triple qualifies, which gives 6 ordered triples.
  assert.equal(solve([3, 4, 6, 9, 10]), 6)
  // A validation case: two qualifying unordered triples give 12 ordered triples.
  assert.equal(solve([4, 6, 7, 3, 2]), 12)
})

test('2198 equal values still count as separate indices', () => {
  // [1, 1, 1]: the sum 3 is divisible by all three values, so no triple has exactly one hit.
  assert.equal(solve([1, 1, 1]), 0)
  // [2, 2, 3]: sum 7 is divisible by none of 2, 2, 3 -> 0 hits; check with the oracle below.
  assert.equal(solve([2, 2, 3]), oracle([2, 2, 3]))
})

test('2198 the parser rejects short or out-of-range lists', () => {
  assert.throws(() => parseInput('{"nums":[1,2]}'))
  assert.throws(() => parseInput('{"nums":[1,2,31]}'))
  assert.throws(() => parseInput('{"nums":[0,2,3]}'))
  assert.throws(() => parseInput('[1,2,3]'))
})

// Independent oracle: enumerate every ordered triple of pairwise distinct indices directly.
function oracle(nums) {
  const n = nums.length
  let count = 0
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      for (let c = 0; c < n; c++) {
        if (a === b || b === c || a === c) continue
        const s = nums[a] + nums[b] + nums[c]
        const div = [nums[a], nums[b], nums[c]].filter(v => s % v === 0).length
        if (div === 1) count++
      }
    }
  }
  return count
}

test('2198 random inputs match the ordered-triple oracle', () => {
  let seed = 2198
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 3 + rnd(6) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2198 frame invariants hold', () => {
  const run = buildTrace({ nums: [3, 4, 6, 9, 10] })
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, f.phase)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, f.phase)
    assert.equal(f.answer % 6, 0)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
