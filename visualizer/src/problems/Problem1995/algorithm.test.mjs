import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: enumerate all index quadruples a < b < c < d.
function oracle(nums) {
  const n = nums.length
  let count = 0
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) {
    if (nums[a] + nums[b] + nums[c] === nums[d]) count++
  }
  return count
}

test('examples', () => {
  assert.equal(solve('[1,2,3,6]'), 1)
  assert.equal(solve('[3,3,6,4,5]'), 0)
  assert.equal(solve('[1,1,1,3,5]'), 4)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[1,1,1,3,5]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the enumeration oracle', () => {
  let state = 139
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 4 + rand(8) }, () => 1 + rand(12))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
