import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, queries) => buildTrace(parseInput(JSON.stringify({ nums, queries }))).result

// Independent oracle: try every subsequence of nums, then every front or back choice for each query.
function oracle(nums, queries) {
  let best = 0
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    const b = nums.filter((_, i) => mask & (1 << i))
    const go = (lo, hi, k) => {
      best = Math.max(best, k)
      if (k === queries.length || lo > hi) return
      const q = queries[k]
      if (b[lo] >= q) go(lo + 1, hi, k + 1)
      if (b[hi] >= q) go(lo, hi - 1, k + 1)
    }
    go(0, b.length - 1, 0)
  }
  return best
}

test('3018 worked presets', () => {
  assert.equal(solve([1, 3, 2, 5, 4], [2, 3, 1, 4]), oracle([1, 3, 2, 5, 4], [2, 3, 1, 4]))
  assert.equal(solve([2, 1, 3], [5, 1]), 0)
  assert.equal(solve([4, 2, 6, 1, 5], [1, 2, 4, 3]), oracle([4, 2, 6, 1, 5], [1, 2, 4, 3]))
})

test('3018 a single value can serve one query only once', () => {
  assert.equal(solve([3], [2, 1]), 1)
  assert.equal(solve([3], [4]), 0)
  assert.equal(solve([5, 5], [5, 5, 5]), 2)
})

test('3018 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[],"queries":[1]}'))
  assert.throws(() => parseInput('{"nums":[1],"queries":[]}'))
  assert.throws(() => parseInput('{"nums":[10],"queries":[1]}'))
  assert.throws(() => parseInput('{"nums":[1],"queries":[0]}'))
})

test('3018 matches the subsequence oracle on random small inputs', () => {
  let seed = 3
  const rand = k => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed % k
  }
  for (let trial = 0; trial < 400; trial++) {
    const nums = Array.from({ length: 1 + rand(6) }, () => 1 + rand(9))
    const queries = Array.from({ length: 1 + rand(6) }, () => 1 + rand(9))
    assert.equal(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})

test('3018 frames stay inside the pseudocode and python ranges', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ nums: [1, 3, 2, 5, 4], queries: [2, 3, 1, 4] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    for (const [x, y] of frame.states) assert.ok(x < y)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).processed, run.result)
})
