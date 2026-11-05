import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2170 worked examples', () => {
  assert.equal(solve('[3,1,3,2,4,3]'), 3)
  assert.equal(solve('[1,2,2,2,2]'), 2)
  assert.equal(solve('[5]'), 0)
  assert.equal(solve('[4,4,4,4]'), 2)
  assert.equal(solve('[1,1,1]'), 1)
})

test('2170 rejects invalid input', () => {
  assert.throws(() => parseInput('[0,1]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1,2.5]'))
})

// Oracle: try all pairs of targets (x for even, y for odd, with x != y) over a small value domain.
function oracle(nums) {
  const n = nums.length
  let best = Infinity
  for (let x = 1; x <= 10; x++) for (let y = 1; y <= 10; y++) {
    if (x === y) continue
    let cost = 0
    for (let i = 0; i < n; i++) if (nums[i] !== (i % 2 === 0 ? x : y)) cost++
    best = Math.min(best, cost)
  }
  return best
}

test('2170 random arrays match a target-pair oracle', () => {
  let seed = 2170
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(4))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})

test('2170 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[3,1,3,2,4,3]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
