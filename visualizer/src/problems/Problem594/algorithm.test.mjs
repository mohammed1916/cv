import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('594 official examples', () => {
  assert.equal(buildTrace([1, 3, 2, 2, 5, 2, 3, 7]).result, 5)
  assert.equal(buildTrace([1, 1, 1, 1]).result, 0)
  assert.equal(buildTrace([1, 2, 3, 4]).result, 2)
})

test('594 exhaustive short arrays match subset enumeration', () => {
  for (let n = 1; n <= 7; n++) for (let code = 0; code < 3 ** n; code++) {
    const nums = []; let c = code
    for (let i = 0; i < n; i++) { nums.push(c % 3); c = Math.floor(c / 3) }
    let best = 0
    for (let mask = 1; mask < 1 << n; mask++) {
      const picked = nums.filter((_, i) => mask & (1 << i))
      if (Math.max(...picked) - Math.min(...picked) === 1) best = Math.max(best, picked.length)
    }
    assert.equal(buildTrace(nums).result, best, JSON.stringify(nums))
  }
})

test('594 rejects empty input', () => {
  assert.throws(() => parseInput('[]'))
})
