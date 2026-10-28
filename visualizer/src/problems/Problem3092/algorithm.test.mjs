import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3092 official examples', () => {
  assert.deepEqual(solve({ nums: [2, 3, 2, 1], freq: [3, 2, -3, 1] }), [3, 3, 2, 2])
  assert.deepEqual(solve({ nums: [5, 5, 3], freq: [2, -2, 1] }), [2, 0, 1])
})

test('3092 an empty collection reports zero', () => {
  assert.deepEqual(solve({ nums: [4, 4], freq: [1, -1] }), [1, 0])
})

test('3092 rejects removing more copies than exist', () => {
  assert.throws(() => parseInput('{"nums":[1],"freq":[-1]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"freq":[1]}'))
  assert.throws(() => parseInput('{"nums":[1],"freq":[0]}'))
})

// Independent oracle: after each step, add up every change to each ID from the start.
function oracle({ nums, freq }) {
  const out = []
  for (let t = 0; t < nums.length; t++) {
    const totals = new Map()
    for (let i = 0; i <= t; i++) totals.set(nums[i], (totals.get(nums[i]) ?? 0) + freq[i])
    let best = 0
    for (const v of totals.values()) if (v > best) best = v
    out.push(best)
  }
  return out
}

test('3092 random collections match a recount-from-scratch oracle', () => {
  let seed = 3092
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(8)
    const nums = Array.from({ length: len }, () => 1 + rnd(4))
    const freq = Array.from({ length: len }, () => (rnd(2) ? 1 + rnd(3) : -(1 + rnd(3))))
    let valid = true
    try { parseInput(JSON.stringify({ nums, freq })) } catch { valid = false }
    if (!valid) continue
    checked++
    assert.deepEqual(solve({ nums, freq }), oracle({ nums, freq }), JSON.stringify({ nums, freq }))
  }
  assert.ok(checked > 50)
})
