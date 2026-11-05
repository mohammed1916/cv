import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: check every pair i <= j directly.
function oracle(nums1, nums2) {
  let best = 0
  for (let i = 0; i < nums1.length; i++) {
    let a = 0, b = 0
    for (let j = i; j < nums1.length; j++) {
      a += nums1[j]; b += nums2[j]
      if (a === b) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

test('examples', () => {
  assert.equal(solve('{"nums1":[1,1,0,1],"nums2":[0,1,1,0]}'), 3)
  assert.equal(solve('{"nums1":[0,1],"nums2":[1,0]}'), 2)
  assert.equal(solve('{"nums1":[0],"nums2":[1]}'), 0)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"nums1":[1,0],"nums2":[0,1]}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the brute-force oracle', () => {
  let state = 23
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(12)
    const nums1 = Array.from({ length: n }, () => rand(2))
    const nums2 = Array.from({ length: n }, () => rand(2))
    assert.equal(solve(JSON.stringify({ nums1, nums2 })), oracle(nums1, nums2))
  }
})
