import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('4047 hand-checked arrays', () => {
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([4, 4]), 0)
  assert.equal(solve([5]), -1)
  assert.equal(solve([1, 2]), -1)
})

test('4047 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[8]}'))
})

// Oracle: breadth-first search over unsorted tuples, with no sorting shortcut.
function oracle(nums) {
  const enc = arr => arr.join(',')
  const seen = new Map([[enc(nums), 0]])
  let level = [nums]
  let depth = 0
  while (level.length) {
    for (const arr of level) {
      if (arr.reduce((a, b) => a ^ b, 0) === 0) return depth
    }
    const nextLevel = []
    for (const arr of level) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          if (arr[i] === arr[j]) continue
          const copy = [...arr]
          copy[i] = arr[i] ^ arr[j]
          if (!seen.has(enc(copy))) { seen.set(enc(copy), depth + 1); nextLevel.push(copy) }
        }
      }
    }
    level = nextLevel
    depth++
  }
  return -1
}

test('4047 random small arrays match the unsorted search oracle', () => {
  let seed = 4047
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(4)
    const nums = Array.from({ length: n }, () => rnd(8))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
