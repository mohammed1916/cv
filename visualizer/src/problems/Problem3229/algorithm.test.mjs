import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace({ nums, target }).result

test('3229 official examples', () => {
  assert.equal(solve([3, 5, 1, 2], [4, 6, 2, 4]), 2)
  assert.equal(solve([1, 3, 2], [2, 1, 4]), 5)
})

test('3229 equal arrays need no operations', () => {
  assert.equal(solve([7, 7, 7], [7, 7, 7]), 0)
})

test('3229 rejects arrays of different lengths', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"target":[1]}'))
})

// Independent oracle: breadth-first search over difference vectors (target minus nums). One
// operation adds or subtracts 1 on a contiguous range, which changes the difference vector the
// same way; the fewest steps to the zero vector is the answer.
function oracle(nums, target) {
  const start = nums.map((v, i) => target[i] - v)
  const bound = Math.max(...start.map(Math.abs)) + 1
  const key = v => v.join(',')
  const dist = new Map([[key(start), 0]])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head]
    const steps = dist.get(key(cur))
    if (cur.every(v => v === 0)) return steps
    for (let l = 0; l < cur.length; l++) {
      for (let r = l; r < cur.length; r++) {
        for (const sign of [1, -1]) {
          const next = cur.slice()
          for (let k = l; k <= r; k++) next[k] -= sign
          if (next.some(v => Math.abs(v) > bound)) continue
          if (!dist.has(key(next))) {
            dist.set(key(next), steps + 1)
            queue.push(next)
          }
        }
      }
    }
  }
  throw new Error('unreachable')
}

test('3229 random arrays match a breadth-first search over differences', () => {
  let seed = 3229
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(4)
    const nums = Array.from({ length: n }, () => 1 + rnd(4))
    const target = Array.from({ length: n }, () => 1 + rnd(4))
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
})
