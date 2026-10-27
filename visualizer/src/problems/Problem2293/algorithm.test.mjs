import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2293 official example', () => {
  assert.equal(solve('{"nums":[1,3,5,2,4,8,2,2]}'), 1)
})

test('2293 rejects a length that is not a power of two', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3]}'))
})

// Independent oracle: a bottom-up recurrence over a complete binary tree, where the node at height h and index j
// combines its two children with min for even j and max for odd j.
function oracle({ nums }) {
  let height = 0
  while (1 << height < nums.length) height += 1
  const value = (h, j) => {
    if (h === 0) return nums[j]
    const a = value(h - 1, 2 * j)
    const b = value(h - 1, 2 * j + 1)
    return j % 2 === 0 ? Math.min(a, b) : Math.max(a, b)
  }
  return value(height, 0)
}

test('2293 seeded random cases match a tree recurrence oracle', () => {
  let seed = 2293
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = [1, 2, 4, 8, 16, 32][rnd(6)]
    const input = { nums: Array.from({ length: len }, () => 1 + rnd(100)) }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
