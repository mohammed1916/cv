import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python, code } from './algorithm.js'

const solve = nums => buildTrace({ nums }).answer

test('2863 worked examples', () => {
  // Pairs (0,2): 2 > 1 gives length 3, and (1,3): 4 > 3 gives length 3. Best is 3.
  assert.equal(solve([2, 4, 1, 3]), 3)
  assert.equal(solve([7, 6, 1, 5]), 4)
  assert.equal(solve([1, 2, 3, 4]), 0)
})

test('2863 edge cases', () => {
  assert.equal(solve([5]), 0)
  assert.equal(solve([5, 5]), 0)
  assert.equal(solve([9, 1]), 2)
  assert.equal(solve([1, 9, 1, 9]), 2)
  assert.throws(() => parseInput('[]'))
  assert.throws(() => buildTrace({ nums: Array(21).fill(1) }))
})

// Independent oracle: every subarray of length >= 2 checked directly.
function oracle(nums) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

test('2863 random arrays match an all-subarrays oracle', () => {
  let seed = 2863
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(8))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2863 frame invariants', () => {
  const codeLines = new Set(code.map(c => c.line))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ nums: [2, 4, 1, 3] }).frames) {
    assert.ok(codeLines.has(frame.activeLine), `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
    assert.equal(typeof frame.message, 'string')
  }
})

test('2863 python export runs on the first example', () => {
  const out = execFileSync('python3', ['-I', '-c', python], { input: '[2,4,1,3]' }).toString().trim()
  assert.equal(out, '3')
})
