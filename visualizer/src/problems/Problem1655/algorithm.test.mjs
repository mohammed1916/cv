import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, quantity) => buildTrace(parseInput(JSON.stringify({ nums, quantity }))).result

test('1655 official examples', () => {
  assert.equal(solve([1, 2, 3, 4], [2]), false)
  assert.equal(solve([1, 2, 3, 3], [2]), true)
  assert.equal(solve([1, 1, 2, 2], [2, 2]), true)
  assert.equal(solve([1, 1, 2, 3], [2, 2]), false)
})

test('1655 one value cannot serve two customers that need more in total', () => {
  assert.equal(solve([5, 5, 5], [1, 1, 1]), true)
  assert.equal(solve([5, 5], [2, 2]), false)
})

test('1655 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1],"quantity":[]}'))
  assert.throws(() => parseInput('{"nums":[11],"quantity":[1]}'))
})

// Independent oracle: give every customer one value (a choice per customer) and check each value's count.
function oracle(nums, quantity) {
  const tally = new Map()
  for (const v of nums) tally.set(v, (tally.get(v) ?? 0) + 1)
  const values = [...tally.values()]
  const m = quantity.length
  const assign = (i, used) => {
    if (i === m) return true
    for (let d = 0; d < values.length; d++) {
      used[d] += quantity[i]
      if (used[d] <= values[d] && assign(i + 1, used)) { used[d] -= quantity[i]; return true }
      used[d] -= quantity[i]
    }
    return false
  }
  return assign(0, values.map(() => 0))
}

test('1655 random inputs match the assignment oracle', () => {
  let seed = 1655
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(4))
    const quantity = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(4))
    assert.equal(solve(nums, quantity), oracle(nums, quantity), JSON.stringify({ nums, quantity }))
  }
})
