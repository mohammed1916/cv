import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: check every index pair.
function oracle(nums, k) {
  let count = 0
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (Math.abs(nums[i] - nums[j]) === k) count++
  return count
}

test('examples', () => {
  assert.equal(solve('{"nums":[1,2,2,1],"k":1}'), 4)
  assert.equal(solve('{"nums":[1,3],"k":3}'), 0)
  assert.equal(solve('{"nums":[3,2,1,5,4],"k":2}'), 3)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"nums":[1,2],"k":1}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the pairwise oracle', () => {
  let state = 211
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rand(20) }, () => 1 + rand(15))
    const k = 1 + rand(8)
    assert.equal(solve(JSON.stringify({ nums, k })), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
