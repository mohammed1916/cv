import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: score every contiguous subarray directly.
function oracle(nums) {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    for (let j = i; j < nums.length; j++) {
      sum += (j - i) % 2 === 0 ? nums[j] : -nums[j]
      best = Math.max(best, sum)
    }
  }
  return best
}

test('examples', () => {
  assert.equal(solve('[3,-1,1,2]'), 5)
  assert.equal(solve('[2,2,2]'), 2)
  assert.equal(solve('[1,2,3,4]'), 4)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[1,2]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the subarray oracle', () => {
  let state = 487
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rand(15) }, () => rand(41) - 20)
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
