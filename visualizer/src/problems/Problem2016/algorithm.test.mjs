import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: every pair i < j.
function oracle(nums) {
  let best = -1
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) {
    if (nums[i] < nums[j]) best = Math.max(best, nums[j] - nums[i])
  }
  return best
}

test('examples', () => {
  assert.equal(solve('[7,1,5,4]'), 4)
  assert.equal(solve('[9,4,3,2]'), -1)
  assert.equal(solve('[1,5,2,10]'), 9)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[1,5,2]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the pair oracle', () => {
  let state = 277
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 2 + rand(12) }, () => 1 + rand(20))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
