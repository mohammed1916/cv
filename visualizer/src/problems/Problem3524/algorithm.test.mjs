import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3524 hand-computed cases', () => {
  // 3, 6, 30, 120 give 0; 2, 5, 20 give 2; 10, 40, 4 give 1.
  assert.deepEqual(solve([3, 2, 5, 4], 3), [4, 3, 3])
  // 2, 6, 3, 12, 18, 36 taken mod 4.
  assert.deepEqual(solve([2, 6, 3], 4), [2, 0, 3, 1])
  assert.deepEqual(solve([7, 9], 1), [3])
  assert.deepEqual(solve([5], 5), [1, 0, 0, 0, 0])
  assert.deepEqual(solve([1000000000], 3), [0, 1, 0])
})

function oracle(nums, k) {
  const out = Array(k).fill(0)
  for (let l = 0; l < nums.length; l++) {
    let product = 1n
    for (let r = l; r < nums.length; r++) {
      product *= BigInt(nums[r])
      out[Number(product % BigInt(k))]++
    }
  }
  return out
}

test('3524 matches every-block enumeration on random arrays', () => {
  let seed = 35
  const next = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  for (let round = 0; round < 1000; round++) {
    const nums = Array.from({ length: 1 + next(12) }, () => 1 + next(round % 2 ? 12 : 1000000000))
    const k = 1 + next(5)
    assert.deepEqual(solve(nums, k), oracle(nums, k))
  }
})

test('3524 stays exact at the official limits', () => {
  const nums = Array(100000).fill(1000000000)
  let ending = [0, 0, 0, 0, 0]
  const totals = [0, 0, 0, 0, 0]
  for (const x of nums) {
    const row = [0, 0, 0, 0, 0]
    for (let r = 0; r < 5; r++) row[r * x % 5] += ending[r]
    row[x % 5] += 1
    for (let r = 0; r < 5; r++) totals[r] += row[r]
    ending = row
  }
  assert.equal(totals[0], 100000 * 100001 / 2)
  assert.ok(Number.isSafeInteger(totals[0]))
})

test('3524 every listed block has the remainder of its bucket', () => {
  for (const { input } of examples) {
    const parsed = parseInput(input)
    for (const frame of buildTrace(parsed).frames) {
      if (!frame.rowBlocks) continue
      frame.rowBlocks.forEach((bucket, r) => {
        assert.equal(bucket.length, frame.row[r])
        for (const block of bucket) {
          const product = block.text.split('×').reduce((acc, value) => acc * BigInt(value), 1n)
          assert.equal(Number(product % BigInt(parsed.k)), r)
          assert.ok(block.start <= frame.i)
        }
        assert.equal(new Set(bucket.map(block => block.start)).size, bucket.length)
      })
    }
  }
})

test('3524 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"nums":[],"k":2}'))
  assert.throws(() => parseInput('{"nums":[0],"k":2}'))
  assert.throws(() => parseInput('{"nums":[1],"k":6}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
  assert.throws(() => parseInput(JSON.stringify({ nums: Array(13).fill(1), k: 2 })))
})

test('3524 frames are complete', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const pyCount = python.trim().split('\n').length
  for (const { input } of examples) {
    const parsed = parseInput(input)
    const { frames, result } = buildTrace(parsed)
    assert.equal(frames.length, 2 + parsed.nums.length * (parsed.k + 4))
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
      assert.ok(frame.message.length > 0)
    }
    assert.deepEqual(frames.at(-1).totals, result)
  }
})
