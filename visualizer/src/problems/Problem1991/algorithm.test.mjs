import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: compare explicit left and right sums for every index.
function oracle(nums) {
  for (let i = 0; i < nums.length; i++) {
    const left = nums.slice(0, i).reduce((a, b) => a + b, 0)
    const right = nums.slice(i + 1).reduce((a, b) => a + b, 0)
    if (left === right) return i
  }
  return -1
}

test('examples', () => {
  assert.equal(solve('[2,3,-1,8,4]'), 3)
  assert.equal(solve('[1,-1,4]'), 2)
  assert.equal(solve('[2,5]'), -1)
  assert.equal(solve('[1]'), 0)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[1,2,1]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the explicit-sum oracle', () => {
  let state = 97
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rand(9) }, () => rand(7) - 3)
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
