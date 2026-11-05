import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: check the global condition by scanning all other indices.
function oracle(nums) {
  let total = 0
  for (let i = 1; i < nums.length - 1; i++) {
    const global = nums.slice(0, i).every(v => v < nums[i]) && nums.slice(i + 1).every(v => v > nums[i])
    if (global) total += 2
    else if (nums[i - 1] < nums[i] && nums[i] < nums[i + 1]) total += 1
  }
  return total
}

test('examples', () => {
  assert.equal(solve('[1,2,3]'), 2)
  assert.equal(solve('[2,4,6,4]'), 1)
  assert.equal(solve('[3,2,1]'), 0)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[1,2,3]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the scanning oracle', () => {
  let state = 263
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 3 + rand(10) }, () => 1 + rand(12))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
