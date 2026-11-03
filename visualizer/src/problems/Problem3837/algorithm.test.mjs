import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

function assertFrames(run) {
  const pyLines = python.split('\n').length
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine in ${f.phase}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine in ${f.phase}`)
    assert.ok(f.message.length > 0)
  }
}

// Independent oracle: quadratic scan over every later index.
function oracle(nums, k) {
  return nums.map((v, i) => {
    let c = 0
    for (let j = i + k + 1; j < nums.length; j++) if (nums[j] === v) c++
    return c
  })
}

test('3837 worked case', () => {
  assert.deepEqual(solve([1, 2, 1, 1, 2], 1), [2, 1, 0, 0, 0])
})

test('3837 k zero counts every later equal element', () => {
  assert.deepEqual(solve([3, 3, 3], 0), [2, 1, 0])
})

test('3837 the excluded index i plus k is never counted', () => {
  assert.deepEqual(solve([5, 5], 1), [0, 0])
  assert.deepEqual(solve([5, 5, 5], 1), [1, 0, 0])
})

test('3837 frames carry valid pseudocode and python lines', () => {
  assertFrames(buildTrace({ nums: [1, 2, 1, 1, 2], k: 1 }))
})

test('3837 parseInput rejects out-of-range values', () => {
  assert.throws(() => parseInput('{"nums":[],"k":0}'))
  assert.throws(() => parseInput('{"nums":[1,99],"k":0}'))
  assert.throws(() => parseInput('{"nums":[1],"k":-1}'))
})

test('3837 random arrays match the quadratic oracle', () => {
  let seed = 3837
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    const nums = Array.from({ length: len }, () => rnd(4) - 2)
    const k = rnd(len + 2)
    assert.deepEqual(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
