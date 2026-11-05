import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (nums, k) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(count_gcd_subarrays(${JSON.stringify(nums)}, ${k}))`]).toString().trim())
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

test('2447 worked examples', () => {
  assert.equal(solve([6, 12, 3, 9], 3), 6)
  assert.equal(solve([4, 8], 5), 0)
  assert.equal(solve([7], 7), 1)
})

test('2447 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [4, 2], k: 2 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2447 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[0],"k":1}'))
})

test('2447 random arrays match a brute force and the python mirror', () => {
  let seed = 2447
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(12))
    const k = 1 + rnd(12)
    let brute = 0
    for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
      let g = 0
      for (let x = i; x <= j; x++) g = gcd(g, nums[x])
      if (g === k) brute++
    }
    assert.equal(solve(nums, k), brute, JSON.stringify({ nums, k }))
    if (t < 8) assert.equal(runPy(nums, k), brute)
  }
})
