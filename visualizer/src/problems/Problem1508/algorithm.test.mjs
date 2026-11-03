import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const MOD = 1000000007n

// Independent oracle with BigInt: list every subarray sum, sort, and add the requested ranks.
function oracle(nums, left, right) {
  const sums = []
  for (let s = 0; s < nums.length; s++) {
    let run = 0n
    for (let e = s; e < nums.length; e++) { run += BigInt(nums[e]); sums.push(run) }
  }
  sums.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  let total = 0n
  for (let r = left - 1; r < right; r++) total += sums[r]
  return Number(total % MOD)
}

test('a small hand-checked case: [1,2,3,4] ranks 1..10 sums to all 10 sums', () => {
  // Subarray sums are 1,2,3,4,3,5,7,6,9,10; their total is 50.
  assert.equal(buildTrace({ nums: [1, 2, 3, 4], left: 1, right: 10 }).result, 50)
})

test('a single rank returns the smallest sum', () => {
  assert.equal(buildTrace({ nums: [5, 9, 2], left: 1, right: 1 }).result, 2)
})

test('random inputs agree with the BigInt oracle', () => {
  let seed = 11
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(100))
    const total = n * (n + 1) / 2
    const left = 1 + rnd(total)
    const right = left + rnd(total - left + 1)
    const input = JSON.stringify({ nums, left, right })
    assert.equal(buildTrace(parseInput(input)).result, oracle(nums, left, right), input)
  }
})

test('parseInput rejects invalid ranks and values', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"left":0,"right":1}'), /left and right/)
  assert.throws(() => parseInput('{"nums":[1,2],"left":2,"right":1}'), /left and right/)
  assert.throws(() => parseInput('{"nums":[1,2],"left":1,"right":4}'), /left and right/)
  assert.throws(() => parseInput('{"nums":[0],"left":1,"right":1}'), /nums/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

test('every frame names a real phase and in-range code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ nums: [3, 1, 2], left: 2, right: 4 })
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length - 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
