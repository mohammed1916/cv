import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (nums, k) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(count_lcm_subarrays(${JSON.stringify(nums)}, ${k}))`]).toString().trim())
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

test('2470 worked examples', () => {
  assert.equal(solve([3, 6, 2, 7, 1], 6), 4)
  assert.equal(solve([3], 2), 0)
  assert.equal(solve([2, 4], 4), 2)
})

test('2470 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [2, 3], k: 6 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2470 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[0],"k":1}'))
})

test('2470 random arrays match a brute force and the python mirror', () => {
  let seed = 2470
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(12))
    const k = 1 + rnd(24)
    let brute = 0
    for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
      let l = 1
      for (let x = i; x <= j; x++) l = (l * nums[x]) / gcd(l, nums[x])
      if (l === k) brute++
    }
    assert.equal(solve(nums, k), brute, JSON.stringify({ nums, k }))
    if (t < 8) assert.equal(runPy(nums, k), brute)
  }
})
