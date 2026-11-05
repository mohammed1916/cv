import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = nums => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(second_greater(${JSON.stringify(nums)}))`]).toString().trim()

function brute(nums) {
  return nums.map((x, i) => {
    let seen = 0
    for (let j = i + 1; j < nums.length; j++) if (nums[j] > x) { seen++; if (seen === 2) return nums[j] }
    return -1
  })
}

test('2454 worked examples', () => {
  assert.deepEqual(solve([3, 1, 4, 1, 5]), [5, 5, -1, -1, -1])
  assert.deepEqual(solve([3, 3]), [-1, -1])
  assert.deepEqual(solve([1, 2, 3, 4]), [3, 4, -1, -1])
})

test('2454 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [1, 2, 3] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2454 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[10]}'))
})

test('2454 random arrays match a direct scan and the python mirror', () => {
  let seed = 2454
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(10))
    assert.deepEqual(solve(nums), brute(nums), JSON.stringify(nums))
    if (t < 8) assert.equal(runPy(nums), `[${brute(nums).join(', ')}]`)
  }
})
