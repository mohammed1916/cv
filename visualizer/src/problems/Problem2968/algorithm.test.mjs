import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('2968 hand-computed cases', () => {
  // Sorted 2 3 7 8 9 12: levelling 7 8 9 12 onto 8 costs 1 + 0 + 1 + 4 = 6.
  assert.equal(solve([9, 2, 7, 3, 12, 8], 6), 4)
  // One move less: 7 8 9 still fits at a cost of 2, and four values do not.
  assert.equal(solve([9, 2, 7, 3, 12, 8], 5), 3)
  assert.equal(solve([5, 5, 1, 5, 8], 0), 3)
  assert.equal(solve([6], 0), 1)
  assert.equal(solve([10, 20], 9), 1)
  assert.equal(solve([10, 20], 10), 2)
  assert.equal(solve([1000000000, 1, 500000000], 1e14), 3)
  assert.equal(solve([1000000000, 1, 500000000], 999999998), 2)
})

// Independent oracle: every value in the array as a target, taking the nearest values first.
function oracle(nums, k) {
  let best = 0
  for (const target of nums) {
    const costs = nums.map(v => Math.abs(v - target)).sort((a, b) => a - b)
    let left = k, count = 0
    for (const c of costs) { if (c > left) break; left -= c; count++ }
    best = Math.max(best, count)
  }
  return best
}

// A second oracle allows every target in the value range, including values absent from the array.
function fullRangeOracle(nums, k) {
  let best = 0
  for (let target = Math.min(...nums); target <= Math.max(...nums); target++) {
    const costs = nums.map(v => Math.abs(v - target)).sort((a, b) => a - b)
    let left = k, count = 0
    for (const c of costs) { if (c > left) break; left -= c; count++ }
    best = Math.max(best, count)
  }
  return best
}

test('2968 random inputs match both oracles', () => {
  let seed = 2968
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 1500; t++) {
    const nums = Array.from({ length: 1 + rnd(14) }, () => 1 + rnd(1 + rnd(40)))
    const k = rnd(40)
    const got = solve(nums, k)
    assert.equal(got, oracle(nums, k), JSON.stringify({ nums, k }))
    assert.equal(got, fullRangeOracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('2968 frames keep the window valid and the costs consistent', () => {
  const nums = [9, 2, 7, 3, 12, 8], k = 6
  const { frames, sorted, result } = buildTrace({ nums, k })
  assert.deepEqual(sorted, [2, 3, 7, 8, 9, 12])
  const lines = python.trim().split('\n').length
  let lastL = 0
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1 && f.pythonLine <= lines)
    assert.ok(f.message.length > 0)
    if (f.phase !== 'done') { assert.ok(f.l >= lastL, 'left end never moves back'); lastL = f.l }
    if (f.phase === 'cost') {
      const target = sorted[f.m]
      const direct = sorted.slice(f.l, f.r + 1).reduce((s, v) => s + Math.abs(v - target), 0)
      assert.equal(f.cost, direct)
      assert.equal(f.m, Math.floor((f.l + f.r) / 2))
    }
    if (f.phase === 'shrink') assert.ok(f.cost > k)
    if (f.phase === 'fit') assert.ok(f.cost <= k)
  }
  const last = frames.at(-1)
  assert.equal(last.phase, 'done')
  assert.equal(last.best, result)
  assert.equal(last.r - last.l + 1, result)
  assert.equal(frames.filter(f => f.phase === 'prefix').length, nums.length)
})

test('2968 parseInput enforces the rules', () => {
  assert.deepEqual(parseInput('{"nums":[1,2],"k":0}'), { nums: [1, 2], k: 0 })
  for (const bad of ['{"nums":[],"k":1}', '{"nums":[0],"k":1}', '{"nums":[1],"k":-1}', '{"nums":[1.5],"k":1}', '{"nums":[1]}', '[]']) assert.throws(() => parseInput(bad))
})
