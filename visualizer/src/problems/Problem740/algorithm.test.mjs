import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(nums) {
  let best = 0
  const values = [...new Set(nums)]
  for (let mask = 0; mask < 1 << values.length; mask++) {
    const chosen = values.filter((_, i) => mask & (1 << i))
    if (chosen.some((v, i) => i > 0 && chosen[i - 1] === v - 1)) continue
    const total = chosen.reduce((s, v) => s + v * nums.filter(x => x === v).length, 0)
    best = Math.max(best, total)
  }
  return best
}

test('740 worked examples', () => {
  assert.equal(buildTrace([3, 4, 2]).result, 6)
  assert.equal(buildTrace([2, 2, 3, 3, 3, 4]).result, 9)
})

test('740 random arrays match an exhaustive search over value subsets', () => {
  let state = 740
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rand(8) }, () => 1 + rand(8))
    assert.equal(buildTrace(nums).result, brute(nums), JSON.stringify(nums))
  }
})

test('740 rejects values above 20', () => {
  assert.throws(() => parseInput('[21]'))
})
