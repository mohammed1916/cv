import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3982 official examples', () => {
  assert.equal(solve([5724, 111, 350]), 6074)
  assert.equal(solve([90, 900]), 990)
})

test('3982 a single number is its own maximum', () => {
  assert.equal(solve([10]), 10)
})

test('3982 rejects a number outside 10 to 100000', () => {
  assert.throws(() => parseInput('{"nums":[9]}'))
})

// Independent oracle: sort the digit characters, then take last minus first as the range.
function oracle(nums) {
  const ranged = nums.map(x => {
    const d = [...String(x)].sort()
    return [Number(d[d.length - 1]) - Number(d[0]), x]
  })
  const best = Math.max(...ranged.map(r => r[0]))
  return ranged.filter(r => r[0] === best).reduce((sum, r) => sum + r[1], 0)
}

test('3982 random arrays match a sorted-digit oracle', () => {
  let seed = 3982
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 10 + rnd(300))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
