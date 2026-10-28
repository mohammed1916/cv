import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3743 official examples', () => {
  assert.equal(solve([1, 2, 3, 3], 2), 3)
  assert.equal(solve([1, 2, 3, 3], 1), 2)
  assert.equal(solve([1, 2, 3, 3], 4), 3)
})

test('3743 a single value scores 0', () => {
  assert.equal(solve([7], 1), 0)
})

test('3743 rejects k above the length', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: choose a nonempty set of cut positions on the circle and sum the arc ranges.
function oracle(nums, k) {
  const n = nums.length
  let best = -Infinity
  for (let mask = 1; mask < 1 << n; mask++) {
    const cuts = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) cuts.push(i)
    if (cuts.length > k) continue
    let score = 0
    for (let c = 0; c < cuts.length; c++) {
      const from = (cuts[c] + 1) % n
      const to = cuts[(c + 1) % cuts.length]
      const arc = []
      for (let i = from; ; i = (i + 1) % n) { arc.push(nums[i]); if (i === to) break }
      score += Math.max(...arc) - Math.min(...arc)
    }
    best = Math.max(best, score)
  }
  return best
}

let seed = 3743
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3743 seeded random against cut-set oracle', () => {
  for (let t = 0; t < 120; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(9))
    const k = 1 + rnd(nums.length)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
