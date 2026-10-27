import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, threshold) => buildTrace(parseInput(JSON.stringify({ nums, threshold }))).result

// Hand-checked cases: these were worked out from the lcm rule, not copied from a published example.
test('3378 hand-checked cases', () => {
  assert.equal(solve([2, 3, 4, 6], 8), 1)
  assert.equal(solve([2, 4, 8, 3, 9], 5), 4)
  assert.equal(solve([4, 8, 2, 10], 5), 3)
})

test('3378 a number whose lcm with every other number is too large stays alone', () => {
  assert.equal(solve([7, 11], 10), 2)
})

test('3378 rejects repeated numbers', () => {
  assert.throws(() => parseInput('{"nums":[2,2],"threshold":4}'))
})

// Independent oracle: find each lcm by scanning the multiples of a, then take connected components by breadth-first search.
function lcmWithin(a, b, threshold) {
  for (let m = a; m <= threshold; m += a) if (m % b === 0) return true
  return false
}

function oracle(nums, threshold) {
  const n = nums.length
  const seen = Array(n).fill(false)
  let count = 0
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue
    count++
    seen[s] = true
    const queue = [s]
    while (queue.length) {
      const cur = queue.shift()
      for (let j = 0; j < n; j++) {
        if (seen[j]) continue
        const linked = lcmWithin(nums[cur], nums[j], threshold) || lcmWithin(nums[j], nums[cur], threshold)
        if (linked) { seen[j] = true; queue.push(j) }
      }
    }
  }
  return count
}

test('3378 random inputs match a multiples-scan oracle', () => {
  let seed = 3378
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pool = Array.from({ length: 30 }, (_, i) => i + 1)
    const nums = []
    const size = 1 + rnd(8)
    while (nums.length < size) {
      const x = pool.splice(rnd(pool.length), 1)[0]
      nums.push(x)
    }
    const threshold = 1 + rnd(60)
    assert.equal(solve(nums, threshold), oracle(nums, threshold), JSON.stringify({ nums, threshold }))
  }
})
