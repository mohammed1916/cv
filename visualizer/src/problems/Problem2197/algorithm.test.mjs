import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2197 worked examples', () => {
  assert.deepEqual(solve([6, 4, 3, 2, 7, 6, 2]), [12, 7, 6])
  assert.deepEqual(solve([2, 2, 1, 1, 3, 3, 3]), [2, 1, 1, 3])
  assert.deepEqual(solve([9, 5, 7]), [9, 5, 7])
  assert.deepEqual(solve([4, 4]), [4])
})

test('2197 rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[61]'))
})

// Oracle: keep merging any adjacent non-coprime pair until none remain (the final array does not depend on the order).
function oracle(nums) {
  const g = (a, b) => (b ? g(b, a % b) : a)
  let arr = nums.slice()
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i + 1 < arr.length; i++) {
      if (g(arr[i], arr[i + 1]) > 1) {
        const merged = (arr[i] * arr[i + 1]) / g(arr[i], arr[i + 1])
        arr.splice(i, 2, merged)
        changed = true
        break
      }
    }
  }
  return arr
}

test('2197 random arrays match a repeat-until-stable oracle', () => {
  let seed = 2197
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(30))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2197 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[6,4,3]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
