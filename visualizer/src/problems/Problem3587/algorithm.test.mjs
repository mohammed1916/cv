import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3587 small examples', () => {
  assert.equal(solve([3, 1, 2]), 1)
  assert.equal(solve([1, 2, 4]), 1)
  assert.equal(solve([2, 4, 6]), -1)
})

test('3587 a value above 99 is rejected', () => {
  assert.throws(() => parseInput('[100]'))
})

// Independent oracle: breadth-first search over arrangements, where each step is one adjacent swap.
function oracle(nums) {
  const alternating = arr => arr.every((v, i) => i === 0 || (v % 2) !== (arr[i - 1] % 2))
  const start = nums.join(',')
  const seen = new Map([[start, 0]])
  const queue = [nums]
  while (queue.length) {
    const arr = queue.shift()
    const dist = seen.get(arr.join(','))
    if (alternating(arr)) return dist
    for (let i = 0; i + 1 < arr.length; i++) {
      const next = [...arr]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      const key = next.join(',')
      if (!seen.has(key)) {
        seen.set(key, dist + 1)
        queue.push(next)
      }
    }
  }
  return -1
}

test('3587 random arrays match the breadth-first oracle', () => {
  let seed = 3587
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(10))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
