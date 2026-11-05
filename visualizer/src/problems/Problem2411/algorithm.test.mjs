import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = nums => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(smallest_subarrays(${JSON.stringify(nums)}))`]).toString().trim()

function brute(nums) {
  const n = nums.length
  const out = []
  for (let i = 0; i < n; i++) {
    let full = 0
    for (let k = i; k < n; k++) full |= nums[k]
    for (let j = i; j < n; j++) {
      let o = 0
      for (let k = i; k <= j; k++) o |= nums[k]
      if (o === full) { out.push(j - i + 1); break }
    }
  }
  return out
}

test('2411 worked examples', () => {
  assert.deepEqual(solve([1, 0, 2, 1, 3]), [3, 3, 2, 2, 1])
  assert.deepEqual(solve([1, 2]), [2, 1])
  assert.deepEqual(solve([0]), [1])
})

test('2411 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [1, 2] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2411 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[16]}'))
})

test('2411 random arrays match a brute force and the python mirror', () => {
  let seed = 2411
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(16))
    assert.deepEqual(solve(nums), brute(nums), JSON.stringify(nums))
    if (t < 8) assert.equal(runPy(nums), JSON.stringify(brute(nums)).replace(/,/g, ', '))
  }
})
