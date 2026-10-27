import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2779 official examples', () => {
  assert.equal(solve({ nums: [4, 6, 1, 2], k: 2 }), 3)
  assert.equal(solve({ nums: [1, 1, 1, 1], k: 10 }), 4)
})

test('2779 rejects a negative value', () => {
  assert.throws(() => parseInput('{"nums":[-1,2],"k":1}'))
})

// Independent oracle: try every target value and count the entries that can reach it.
function oracle({ nums, k }) {
  const low = Math.min(...nums) - k
  const high = Math.max(...nums) + k
  let best = 0
  for (let target = low; target <= high; target++) {
    const reachable = nums.filter(x => Math.abs(x - target) <= k).length
    best = Math.max(best, reachable)
  }
  return best
}

test('2779 seeded random cases match target enumeration', () => {
  let seed = 2779
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(10) }, () => rnd(31)), k: rnd(11) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
