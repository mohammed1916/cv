import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: try every subarray and check max minus min directly.
function oracle(nums, limit) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const part = nums.slice(i, j + 1)
      if (Math.max(...part) - Math.min(...part) <= limit) best = Math.max(best, part.length)
    }
  }
  return best
}

test('a spread that stays within the limit keeps the whole run', () => {
  assert.equal(buildTrace({ nums: [4, 2, 5, 3], limit: 4 }).result, 4)
})

test('the window must shrink when a large value enters', () => {
  assert.equal(buildTrace({ nums: [10, 1, 2, 9, 3], limit: 2 }).result, 2)
})

test('limit zero keeps only runs of equal values', () => {
  assert.equal(buildTrace({ nums: [7, 7, 8, 8, 8, 7], limit: 0 }).result, 3)
})

test('matches the brute-force oracle on pseudo-random arrays', () => {
  let seed = 12345
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(14)
    const nums = Array.from({ length: n }, () => rand(20))
    const limit = rand(10)
    assert.equal(buildTrace({ nums, limit }).result, oracle(nums, limit), JSON.stringify({ nums, limit }))
  }
})

test('frames use declared phases and existing code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace({ nums: [1, 5, 3, 8], limit: 3 }).frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(code.some(l => l.line === frame.activeLine))
  }
  assert.equal(code.length, python.split('\n').length)
})

test('parseInput validates the object shape and bounds', () => {
  assert.deepEqual(parseInput('{"nums":[4,2],"limit":1}'), { nums: [4, 2], limit: 1 })
  assert.throws(() => parseInput('[4,2]'), /object/)
  assert.throws(() => parseInput('{"nums":[4,-2],"limit":1}'), /integer/)
})
