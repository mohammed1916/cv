import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3542 official examples', () => {
  assert.equal(solve([0, 2]), 1)
  assert.equal(solve([3, 1, 2, 1]), 3)
  assert.equal(solve([1, 2, 1, 2, 1, 2]), 4)
})

test('3542 edge cases', () => {
  assert.equal(solve([0, 0, 0]), 0)
  assert.equal(solve([4]), 1)
  assert.equal(solve([2, 2, 2]), 1)
})

test('3542 rejects values above 5', () => {
  assert.throws(() => parseInput('{"nums":[6]}'))
})

// Independent oracle: breadth-first search over arrays. One operation picks a subarray and zeroes the minimum value's occurrences inside it.
function oracle(nums) {
  const start = nums.join(',')
  const seen = new Set([start])
  let frontier = [nums.slice()]
  let depth = 0
  for (;;) {
    if (frontier.some(arr => arr.every(v => v === 0))) return depth
    const next = []
    for (const arr of frontier) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i; j < arr.length; j++) {
          const m = Math.min(...arr.slice(i, j + 1))
          if (m === 0) continue
          const copy = arr.slice()
          for (let k = i; k <= j; k++) if (copy[k] === m) copy[k] = 0
          const key = copy.join(',')
          if (!seen.has(key)) { seen.add(key); next.push(copy) }
        }
      }
    }
    frontier = next
    depth++
  }
}

test('3542 random arrays match a breadth-first search over operations', () => {
  let seed = 3542
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(4))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
