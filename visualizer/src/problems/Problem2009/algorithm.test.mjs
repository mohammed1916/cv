import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: the final array is n consecutive integers starting at some s; try every s.
function oracle(nums) {
  const n = nums.length
  const distinct = new Set(nums)
  let best = Infinity
  for (let s = Math.min(...nums); s <= Math.max(...nums); s++) {
    let kept = 0
    for (let v = s; v < s + n; v++) if (distinct.has(v)) kept++
    best = Math.min(best, n - kept)
  }
  return best
}

test('examples', () => {
  assert.equal(solve('[4,2,5,3]'), 0)
  assert.equal(solve('[1,2,3,5,6]'), 1)
  assert.equal(solve('[1,10,50,100]'), 3)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[1,2,3,5,6]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the start-value oracle', () => {
  let state = 239
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rand(12) }, () => 1 + rand(30))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
