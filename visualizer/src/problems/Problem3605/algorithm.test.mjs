import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, gcd, greedyEdits, code, python, phases } from './algorithm.js'

const solve = (nums, maxC) => buildTrace({ nums, maxC }).result

// Longest stretch whose gcd is at least 2, walking every subarray directly.
function longestStable(values) {
  let best = 0
  for (let l = 0; l < values.length; l++) {
    let g = 0
    for (let r = l; r < values.length; r++) {
      g = gcd(g, values[r])
      if (g >= 2) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

test('3605 hand-computed cases', () => {
  // Runs 12,18,24,30 and 14,21,7. One edit in each: split the first in half, the second around 21.
  assert.equal(solve([12, 18, 24, 30, 5, 14, 21, 7, 9], 2), 2)
  assert.equal(solve([12, 18, 24, 30, 5, 14, 21, 7, 9], 1), 3)
  // Stable pairs (6,10) (10,15) (4,8) (3,9) need three edits to remove.
  assert.equal(solve([6, 10, 15, 4, 8, 3, 9], 1), 2)
  assert.equal(solve([6, 10, 15, 4, 8, 3, 9], 3), 1)
})

test('3605 edges', () => {
  assert.equal(solve([1, 1, 1], 0), 0)
  assert.equal(solve([7], 0), 1)
  assert.equal(solve([7], 1), 0)
  assert.equal(solve([1], 0), 0)
  assert.equal(solve([4, 6, 9], 0), 2)
  assert.equal(solve([4, 6, 9], 3), 0)
  assert.equal(solve([1000000000, 999999998], 0), 2)
})

test('3605 parseInput rejects bad input', () => {
  assert.doesNotThrow(() => parseInput('{"nums":[2],"maxC":1}'))
  assert.throws(() => parseInput('{"nums":[],"maxC":0}'))
  assert.throws(() => parseInput('{"nums":[0],"maxC":0}'))
  assert.throws(() => parseInput('{"nums":[2],"maxC":2}'))
  assert.throws(() => parseInput('{"nums":[2],"maxC":-1}'))
  assert.throws(() => parseInput('{"nums":[1.5],"maxC":0}'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput(`{"nums":${JSON.stringify(Array(15).fill(2))},"maxC":0}`))
})

// Oracle: every subset of at most maxC positions replaced with 1, the value that breaks the most windows.
function oracle(nums, maxC) {
  let best = Infinity
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let bits = 0
    for (let m = mask; m; m &= m - 1) bits++
    if (bits > maxC) continue
    best = Math.min(best, longestStable(nums.map((value, i) => (mask >> i & 1 ? 1 : value))))
  }
  return best
}

test('3605 agrees with an all-subsets oracle on random arrays', () => {
  let seed = 3605
  const rand = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  const pool = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 30]
  for (let t = 0; t < 500; t++) {
    const n = 1 + rand(10)
    const nums = Array.from({ length: n }, () => pool[rand(pool.length)])
    const maxC = rand(n + 1)
    assert.equal(solve(nums, maxC), oracle(nums, maxC), JSON.stringify({ nums, maxC }))
  }
})

test('3605 the done frame shows a real witness', () => {
  for (const [nums, maxC] of [[[12, 18, 24, 30, 5, 14, 21, 7, 9], 2], [[6, 10, 15, 4, 8, 3, 9], 1], [[2, 4, 8, 16, 32, 64], 2]]) {
    const { frames, result } = buildTrace({ nums, maxC })
    const edited = frames.at(-1).edited
    assert.ok(edited.length <= maxC)
    assert.deepEqual(edited, greedyEdits(nums, result))
    assert.ok(longestStable(nums.map((value, i) => (edited.includes(i) ? 1 : value))) <= result)
  }
})

test('3605 sparse table cells are true range gcds', () => {
  const nums = [12, 18, 24, 30, 5, 14, 21, 7, 9]
  const { table } = buildTrace({ nums, maxC: 2 }).frames.at(-1)
  table.forEach((row, level) => row.forEach((value, i) => {
    let g = 0
    for (let j = i; j < i + (1 << level); j++) g = gcd(g, nums[j])
    assert.equal(value, g)
  }))
})

test('3605 frames are well formed', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const lines = python.split('\n')
  for (const [nums, maxC] of [[[12, 18, 24, 30, 5, 14, 21, 7, 9], 2], [[6, 10, 15, 4, 8, 3, 9], 1], [[1, 1, 1], 0]]) {
    const { frames } = buildTrace(parseInput(JSON.stringify({ nums, maxC })))
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase), frame.phase)
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      const line = lines[frame.pythonLine - 1]
      assert.ok(line.trim() && !line.trim().startsWith('def ') && !line.startsWith('from '), line)
      assert.ok(frame.message.length > 0)
      if (frame.query) assert.equal(frame.query.g, gcd(frame.query.left, frame.query.right))
      assert.ok(frame.lo <= frame.hi)
    }
    assert.equal(frames.at(-1).phase, 'done')
    assert.equal(frames.at(-1).lo, frames.at(-1).hi)
  }
})
