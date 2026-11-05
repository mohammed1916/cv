import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: sum every contiguous subarray directly.
function oracle(nums) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    let ones = 0, zeros = 0
    for (let j = i; j < nums.length; j++) {
      if (nums[j] === 1) ones++; else zeros++
      if (ones > zeros) count++
    }
  }
  return count
}

test('examples', () => {
  assert.equal(solve('[0,1,1,0,1]'), 9)
  assert.equal(solve('[0]'), 0)
  assert.equal(solve('[1,1,1]'), 6)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[0,1]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the subarray oracle', () => {
  let state = 443
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rand(20) }, () => rand(2))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
