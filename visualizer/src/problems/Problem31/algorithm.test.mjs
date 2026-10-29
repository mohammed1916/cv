import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, code } from './algorithm.js'
function bruteNext(nums) {
  const sorted = [...nums].sort((a, b) => a - b)
  const perms = []
  const used = new Array(sorted.length).fill(false), cur = []
  const gen = () => {
    if (cur.length === sorted.length) { perms.push([...cur]); return }
    let last = null
    for (let k = 0; k < sorted.length; k++) {
      if (used[k] || sorted[k] === last) continue
      last = sorted[k]; used[k] = true; cur.push(sorted[k]); gen(); cur.pop(); used[k] = false
    }
  }
  gen()
  const key = a => a.join(',')
  const idx = perms.findIndex(p => key(p) === key(nums))
  return idx + 1 < perms.length ? perms[idx + 1] : perms[0]
}
test('31 matches brute-force next permutation for all arrays up to length 5 over 0..2 and wrap cases', () => {
  for (let n = 1; n <= 5; n++) {
    const total = 3 ** n
    for (let c = 0; c < total; c++) {
      const nums = []; let x = c
      for (let k = 0; k < n; k++) { nums.push(x % 3); x = Math.floor(x / 3) }
      const sorted = [...nums].sort((a, b) => a - b)
      const expected = bruteNext(sorted.length ? nums : nums)
      const run = buildTrace(nums)
      assert.deepEqual(run.result, expected, `input ${nums}`)
      assert.deepEqual(run.frames.at(-1).nums, expected)
      assert.equal(run.frames.at(-1).phase, 'done')
    }
  }
})
test('31 frames never mutate earlier snapshots and end at the result', () => {
  const run = buildTrace([1, 3, 2])
  assert.deepEqual(run.frames[0].nums, [1, 3, 2])
  assert.deepEqual(run.result, [2, 1, 3])
  assert.notStrictEqual(run.frames[0].nums, run.frames.at(-1).nums)
})
test('31 rejects malformed input', () => {
  for (const text of ['[]', '[101]', '[-1]', '[1.5]', '"ab"', '{}', '[1,"2"]']) assert.throws(() => parseInput(text))
  assert.deepEqual(parseInput('[3]'), [3])
})
test('31 python and pseudocode exports are present and aligned', () => {
  assert.match(python, /def nextPermutation\(nums\):/)
  assert.equal(code.length, 11)
})
