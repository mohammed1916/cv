import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2219 worked examples', () => {
  assert.equal(solve('[4,3,-2,5]'), 10)
  assert.equal(solve('[1,-1]'), 1)
  assert.equal(solve('[-5]'), -5)
  assert.equal(solve('[-3,-1,-2]'), -2)
})

test('2219 rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[101]'))
})

// Oracle: for every index, compute prefix and suffix sums directly.
function oracle(nums) {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    let pre = 0
    let suf = 0
    for (let k = 0; k <= i; k++) pre += nums[k]
    for (let k = i; k < nums.length; k++) suf += nums[k]
    best = Math.max(best, Math.max(pre, suf))
  }
  return best
}

test('2219 random arrays match a direct-sum oracle', () => {
  let seed = 2219
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(41) - 20)
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})

test('2219 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[4,3,-2,5]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
