import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

// Brute force: every way to cut the list into exactly k non-empty blocks.
function brute(nums, k) {
  const n = nums.length
  let best = Infinity
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const blocks = []
    let start = 0
    for (let i = 0; i < n - 1; i++) if (mask & (1 << i)) { blocks.push([start, i + 1]); start = i + 1 }
    blocks.push([start, n])
    if (blocks.length !== k) continue
    let score = 0
    for (const [a, b] of blocks) {
      const s = nums.slice(a, b).reduce((x, y) => x + y, 0)
      score += (s * (s + 1)) / 2
    }
    best = Math.min(best, score)
  }
  return best
}

test('3826 worked cases', () => {
  assert.equal(solve({ nums: [1, 2, 3], k: 1 }), 21)
  assert.equal(solve({ nums: [4, 2, 3, 1], k: 2 }), 31)
})

test('3826 matches a brute force for every k', () => {
  const nums = [3, 1, 4, 1, 5, 9]
  for (let k = 1; k <= nums.length; k++) assert.equal(solve({ nums, k }), brute(nums, k), `k=${k}`)
})

test('3826 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ nums: [2, 3], k: 2 }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3826 rejects k above the length', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})
