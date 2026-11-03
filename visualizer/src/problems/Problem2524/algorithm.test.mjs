import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

function checkFrames(run) {
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.terms))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

// Brute force: recompute every window from scratch with BigInt modular powers.
function oracle(nums, k) {
  const MOD = 1000000007n
  let best = 0n
  for (let s = 0; s + k <= nums.length; s++) {
    const counts = new Map()
    for (const v of nums.slice(s, s + k)) counts.set(v, (counts.get(v) ?? 0) + 1)
    let score = 0n
    for (const [v, f] of counts) {
      let p = 1n
      for (let t = 0; t < f; t++) p = (p * BigInt(v)) % MOD
      score = (score + p) % MOD
    }
    if (score > best) best = score
  }
  return Number(best)
}

test('2524 local presets match hand-checked windows', () => {
  // [2,2,1,2,3] with k=3: [2,2,1] and [2,1,2] score 2^2+1 = 5; [1,2,3] scores 1+2+3 = 6.
  assert.equal(solve([2, 2, 1, 2, 3], 3), 6)
  // [5,1,5,1,5,2] with k=4: [5,1,5,2] scores 5^2+1+2 = 28.
  assert.equal(solve([5, 1, 5, 1, 5, 2], 4), 28)
  assert.equal(solve([3, 3, 3, 3], 2), 9)
})

test('2524 a window of length one scores its own value', () => {
  assert.equal(solve([4, 9, 2], 1), 9)
})

test('2524 scores are compared after reduction', () => {
  assert.equal(solve([20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20], 12), oracle(Array(12).fill(20), 12))
})

test('2524 random inputs match the recompute oracle', () => {
  let seed = 2524
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(10)
    const nums = Array.from({ length: n }, () => 1 + rnd(6))
    const k = 1 + rnd(n)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('2524 frame invariants hold', () => {
  checkFrames(buildTrace({ nums: [5, 1, 5, 1, 5, 2], k: 4 }))
  checkFrames(buildTrace({ nums: [3, 3, 3, 3], k: 2 }))
})

test('2524 rejects k larger than nums', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})
