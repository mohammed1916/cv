import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: breadth-first exploration of every array reachable by the operation
// (nums[i] = nums[i] AND nums[j], nums[j] = nums[i] OR nums[j]), then the best sum of k squares.
function oracle({ nums, k }) {
  const key = arr => arr.join(',')
  const seen = new Set([key(nums)])
  const stack = [nums]
  let best = -1
  while (stack.length) {
    const arr = stack.pop()
    const top = arr.slice().sort((a, b) => b - a).slice(0, k)
    best = Math.max(best, top.reduce((s, v) => s + v * v, 0))
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length; j++) {
        if (i === j) continue
        const t = arr.slice()
        t[i] = arr[i] & arr[j]
        t[j] = arr[i] | arr[j]
        const kk = key(t)
        if (!seen.has(kk)) { seen.add(kk); stack.push(t) }
      }
    }
  }
  return best % 1000000007
}

test('2897 examples', () => {
  assert.equal(solve({ nums: [2, 6, 5, 8], k: 2 }), 261)
  assert.equal(solve({ nums: [4, 5, 4, 7], k: 3 }), 90)
})

test('2897 rejects k larger than the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

test('2897 small arrays match a reachable-state search', () => {
  let seed = 2897
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(3)
    const nums = Array.from({ length: len }, () => rnd(8))
    const k = 1 + rnd(len)
    assert.equal(solve({ nums, k }), oracle({ nums, k }), JSON.stringify({ nums, k }))
  }
})
