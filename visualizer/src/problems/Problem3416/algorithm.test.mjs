import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, code } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Oracle: list every size-5 subsequence and check its middle directly.
function brute(nums) {
  const n = nums.length
  let count = 0
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) for (let e = d + 1; e < n; e++) {
    const seq = [nums[a], nums[b], nums[c], nums[d], nums[e]]
    const tally = new Map()
    for (const v of seq) tally.set(v, (tally.get(v) ?? 0) + 1)
    const mid = tally.get(seq[2])
    if ([...tally].every(([v, k]) => v === seq[2] || k < mid)) count++
  }
  return count
}

test('3416 hand-computed cases', () => {
  // Five equal values: the single pick works.
  assert.equal(solve([4, 4, 4, 4, 4]), 1)
  // Nothing repeats, so the middle appears once and ties everything.
  assert.equal(solve([10, 20, 30, 40, 50, 60]), 0)
  // Only pick: middle 3 appears twice, 1 and 2 and 5 appear once.
  assert.equal(solve([3, 1, 3, 2, 5]), 1)
  // Only pick: middle 3 appears twice but so does 8.
  assert.equal(solve([3, 8, 3, 8, 5]), 0)
  // Only pick: middle 7 appears three times, 2 appears twice.
  assert.equal(solve([7, 7, 7, 2, 2]), 1)
})

test('3416 negative values count as ordinary values', () => {
  assert.equal(solve([-1, -1, -1, -2, -3]), 1)
  assert.equal(solve([-5, 5, -5, 6, 7]), 1)
})

test('3416 small arrays with few values match the oracle exhaustively', () => {
  for (let len = 5; len <= 7; len++) {
    for (let code2 = 0; code2 < 4 ** len; code2 += len === 7 ? 3 : 1) {
      const nums = []
      let c = code2
      for (let k = 0; k < len; k++) { nums.push(c % 4); c = Math.floor(c / 4) }
      assert.equal(solve(nums), brute(nums), JSON.stringify(nums))
    }
  }
})

test('3416 random arrays match the oracle', () => {
  let seed = 3416
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const range = 2 + rnd(7)
    const nums = Array.from({ length: 5 + rnd(14) }, () => rnd(range) - 3)
    assert.equal(solve(nums), brute(nums), JSON.stringify(nums))
  }
})

test('3416 input validation', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3,4]}'))
  assert.throws(() => parseInput('{"nums":[1,2,3,4,1.5]}'))
  assert.throws(() => parseInput('{"nums":[1,2,3,4,2000000000]}'))
  assert.deepEqual(parseInput('{"nums":[1,2,3,4,5]}').nums, [1, 2, 3, 4, 5])
})

test('3416 every middle: grid cells cover all picks and tables agree with the formula', () => {
  let seed = 34160
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 60; t++) {
    const nums = Array.from({ length: 5 + rnd(10) }, () => rnd(5))
    const { frames } = buildTrace({ nums })
    for (const f of frames.filter(g => g.phase === 'oneRight')) {
      const { raw, total } = f.cases
      assert.equal(raw.flat().reduce((sum, v) => sum + v, 0), total)
      assert.equal(f.rows.list.reduce((sum, row) => sum + row.ways, 0), f.cases.oneRight)
      assert.ok(f.cases.oneRight <= raw[0][1])
    }
    for (const f of frames.filter(g => g.phase === 'oneLeft')) {
      assert.equal(f.rows.list.reduce((sum, row) => sum + row.ways, 0), f.cases.oneLeft)
      assert.ok(f.cases.oneLeft <= f.cases.raw[1][0])
    }
  }
})

test('3416 running sums match a recomputation from the drawn counts', () => {
  const { frames } = buildTrace({ nums: [7, 2, 7, 9, 4, 7, 2] })
  for (const f of frames) {
    const sum = g => f.freq.reduce((acc, row) => acc + g(row.left, row.right), 0)
    assert.equal(f.totals.sumL2, sum((a) => a * a))
    assert.equal(f.totals.sumR2, sum((a, b) => b * b))
    assert.equal(f.totals.lr, sum((a, b) => a * b))
    assert.equal(f.totals.lr2, sum((a, b) => a * b * b))
    assert.equal(f.totals.l2r, sum((a, b) => a * a * b))
  }
})

test('3416 frames map to real lines and skip the indices near the ends', () => {
  const nums = [7, 2, 7, 9, 4, 7, 2]
  const { frames } = buildTrace({ nums })
  const pyLines = python.split('\n')
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
    assert.ok(f.message.length > 0)
  }
  assert.deepEqual(frames.filter(f => f.phase === 'skip').map(f => f.at), [0, 1, 5, 6])
  assert.deepEqual(frames.filter(f => f.phase === 'add').map(f => f.at), [2, 3, 4])
  assert.equal(frames.at(-1).phase, 'done')
})
