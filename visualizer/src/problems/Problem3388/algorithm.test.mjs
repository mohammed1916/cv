import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3388 worked examples', () => {
  assert.equal(solve([1, 1, 2, 1]), 2)
  assert.equal(solve([1, 2, 3, 0]), 0)
  assert.equal(solve([0, 0, 0]), 1)
  assert.equal(solve([0, 0, 0, 0]), 3)
})

test('3388 a prefix must be no longer than the part it prefixes', () => {
  // [1, 2] cannot be a prefix of [1]; only the second split with [1] before [1, 2] counts.
  assert.equal(solve([1, 2, 1]), 0)
  assert.equal(solve([1, 1, 2]), 1)
})

test('3388 rejects fewer than three values', () => {
  assert.throws(() => parseInput('{"nums":[1,2]}'))
})

// Independent oracle: encode each part as a string with separators, then test startsWith.
function oracle(nums) {
  const key = arr => arr.map(v => `${v};`).join('')
  let count = 0
  const n = nums.length
  for (let i = 1; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = key(nums.slice(0, i)), b = key(nums.slice(i, j)), c = key(nums.slice(j))
      if (b.startsWith(a) || c.startsWith(b)) count++
    }
  }
  return count
}

test('3388 random arrays match a string-encoding oracle', () => {
  let seed = 3388
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 3 + rnd(8) }, () => rnd(4))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
