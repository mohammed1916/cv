import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('1675 official examples', () => {
  assert.equal(solve([1, 2, 3, 4]), 1)
  assert.equal(solve([4, 1, 5, 20, 3]), 3)
  assert.equal(solve([2, 10, 8]), 3)
})

test('1675 a single repeated value has no deviation', () => {
  assert.equal(solve([7, 7]), 0)
})

test('1675 rejects a single number', () => {
  assert.throws(() => parseInput('{"nums":[4]}'))
})

// Independent oracle: each value can only take the values o * 2^j reachable from it, so try every combination.
function reachable(x) {
  let o = x
  let v = 0
  while (o % 2 === 0) { o /= 2; v++ }
  const out = []
  for (let j = 0; j <= Math.max(v, 1); j++) out.push(o * 2 ** j)
  return out
}

function oracle(nums) {
  let best = Infinity
  const pick = (i, chosen) => {
    if (i === nums.length) {
      best = Math.min(best, Math.max(...chosen) - Math.min(...chosen))
      return
    }
    for (const value of reachable(nums[i])) pick(i + 1, [...chosen, value])
  }
  pick(0, [])
  return best
}

test('1675 random inputs match an exhaustive oracle', () => {
  let seed = 1675
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(3) }, () => 1 + rnd(16))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
