import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (nums, target) => buildTrace({ nums, target }).result

// Independent oracle: enumerate every nonempty subset and test its minimum plus maximum.
function brute(nums, target) {
  let count = 0
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    const chosen = nums.filter((_, i) => mask & (1 << i))
    if (Math.min(...chosen) + Math.max(...chosen) <= target) count++
  }
  return count % 1000000007
}

test('1498 sample inputs give the expected counts', () => {
  assert.equal(solve([2, 6, 4, 1, 9], 8), brute([2, 6, 4, 1, 9], 8))
  assert.equal(solve([1, 1, 1], 2), 7)
  assert.equal(solve([5, 10, 20, 40], 30), brute([5, 10, 20, 40], 30))
})

test('1498 parseInput rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"target":0}'), /target/)
  assert.throws(() => parseInput('{"nums":[0,2],"target":5}'), /nums/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

test('1498 random small arrays match the subset oracle', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(30))
    const target = 1 + rnd(60)
    assert.equal(solve(nums, target), brute(nums, target), JSON.stringify({ nums, target }))
  }
})

test('1498 every frame names a real phase, code lines and narration', () => {
  const run = buildTrace({ nums: [2, 6, 4, 1, 9], target: 8 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
