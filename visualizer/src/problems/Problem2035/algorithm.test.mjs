import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every half-size subset as the first group.
function oracle(nums) {
  const n = nums.length / 2
  const total = nums.reduce((a, b) => a + b, 0)
  let best = Infinity
  for (let m = 0; m < 1 << nums.length; m++) {
    let size = 0, sum = 0
    for (let i = 0; i < nums.length; i++) if (m & (1 << i)) { size++; sum += nums[i] }
    if (size === n) best = Math.min(best, Math.abs(total - 2 * sum))
  }
  return best
}

test('examples', () => {
  assert.equal(solve('[3,9,7,3]'), 2)
  assert.equal(solve('[-36,36]'), 72)
  assert.equal(solve('[2,-1,0,4,-2,-9]'), 0)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[1,2,3,4]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random inputs match the subset oracle', () => {
  let state = 479
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 120; t++) {
    const nums = Array.from({ length: 2 * (1 + rand(5)) }, () => rand(41) - 20)
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
