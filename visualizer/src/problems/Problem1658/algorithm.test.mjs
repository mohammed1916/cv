import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (nums, x) => buildTrace({ nums, x }).result

test('1658 teaching cases return the expected answers', () => {
  assert.equal(solve([1, 1, 4, 2, 3], 5), 2)
  assert.equal(solve([2, 3, 1, 5, 4], 6), 2)
  assert.equal(solve([5, 6, 7, 8, 9], 4), -1)
  assert.equal(solve([3], 3), 1)
  assert.equal(solve([3], 4), -1)
  assert.equal(solve([1, 2, 3], 6), 3)
})

test('1658 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[],"x":3}'), /nums/)
  assert.throws(() => parseInput('{"nums":[1,0],"x":3}'), /nums/)
  assert.throws(() => parseInput('{"nums":[1,2],"x":0}'), /x/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

// Independent oracle: try every count of removed values from the left and from the right.
function oracle(nums, x) {
  const n = nums.length
  let best = -1
  for (let i = 0; i <= n; i++) for (let j = 0; i + j <= n; j++) {
    const removed = nums.slice(0, i).reduce((a, b) => a + b, 0) + nums.slice(n - j).reduce((a, b) => a + b, 0)
    if (removed === x && (best === -1 || i + j < best)) best = i + j
  }
  return best
}

test('1658 matches an exhaustive end-removal oracle on random arrays', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(8)
    const nums = Array.from({ length: len }, () => 1 + rnd(9))
    const x = 1 + rnd(30)
    parseInput(JSON.stringify({ nums, x }))
    assert.equal(solve(nums, x), oracle(nums, x), JSON.stringify({ nums, x }))
  }
})

test('1658 frames point to valid code and Python lines', () => {
  const { frames } = buildTrace({ nums: [1, 1, 4, 2, 3], x: 5 })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(phaseIds.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
})
