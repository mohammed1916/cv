import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('1681 official examples', () => {
  assert.equal(solve([1, 2, 1, 4], 2), 4)
  assert.equal(solve([6, 3, 8, 1, 3, 1, 2, 2], 4), 6)
  assert.equal(solve([5, 3, 3, 6, 3, 3], 3), -1)
})

test('1681 one group takes everything, and groups of one cost nothing', () => {
  assert.equal(solve([3, 1, 2], 1), 2)
  assert.equal(solve([4, 4], 2), 0)
})

test('1681 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"k":2}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
  assert.throws(() => parseInput('{"nums":[17,1],"k":1}'))
})

// Independent oracle: assign every element to one of k labelled groups with room for size elements each,
// and take the cheapest complete assignment where every group has distinct values.
function oracle(nums, k) {
  const n = nums.length
  const size = n / k
  const groups = Array.from({ length: k }, () => [])
  let best = Infinity
  const place = i => {
    if (i === n) {
      let total = 0
      for (const group of groups) {
        if (new Set(group).size !== group.length) return
        total += Math.max(...group) - Math.min(...group)
      }
      best = Math.min(best, total)
      return
    }
    for (const group of groups) {
      if (group.length === size) continue
      group.push(nums[i])
      place(i + 1)
      group.pop()
    }
  }
  place(0)
  return best === Infinity ? -1 : best
}

test('1681 random arrays match the assignment oracle', () => {
  let seed = 1681
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const divisors = [1, 2, 3, 4].filter(d => d <= n && n % d === 0)
    const k = divisors[rnd(divisors.length)]
    const nums = Array.from({ length: n }, () => 1 + rnd(8))
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
