import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: for each divisor, try every rotation combination of the blocks and test sortedness.
function oracle(nums) {
  const n = nums.length
  let total = 0
  for (let k = 1; k <= n; k++) {
    if (n % k) continue
    const blocks = n / k
    const choose = (b, acc) => {
      if (b === blocks) return acc.every((v, i) => i === 0 || acc[i - 1] <= v)
      const block = nums.slice(b * k, b * k + k)
      for (let r = 0; r < k; r++) {
        if (choose(b + 1, [...acc, ...block.slice(r), ...block.slice(0, r)])) return true
      }
      return false
    }
    if (choose(0, [])) total += k
  }
  return total
}

test('3886 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"nums":[4,5,1,2]}')).result, 4)
  assert.equal(buildTrace(parseInput('{"nums":[2,1,3,4]}')).result, 2)
})

test('3886 matches the rotation oracle on small arrays', () => {
  for (let trial = 0; trial < 300; trial++) {
    const nums = Array.from({ length: 1 + (trial % 6) }, () => 1 + Math.floor(Math.random() * 4))
    assert.equal(buildTrace({ nums }).result, oracle(nums), JSON.stringify(nums))
  }
})
