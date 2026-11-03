import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3674 worked examples', () => {
  assert.equal(solve([1, 2]), 1)
  assert.equal(solve([5, 5, 5]), 0)
})

test('3674 rejects values outside the cap', () => {
  assert.throws(() => parseInput('{"nums":[32,1]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Oracle: breadth-first search over arrays, where an operation replaces a subarray with its AND.
function oracle(nums) {
  const key = a => a.join(',')
  const isEqual = a => a.every(x => x === a[0])
  const start = nums
  const dist = new Map([[key(start), 0]])
  const queue = [start]
  for (let h = 0; h < queue.length; h++) {
    const cur = queue[h]
    if (isEqual(cur)) return dist.get(key(cur))
    for (let l = 0; l < cur.length; l++) {
      for (let r = l; r < cur.length; r++) {
        let and = cur[l]
        for (let t = l + 1; t <= r; t++) and &= cur[t]
        const next = cur.map((x, i) => (i >= l && i <= r ? and : x))
        if (!dist.has(key(next))) { dist.set(key(next), dist.get(key(cur)) + 1); queue.push(next) }
      }
    }
  }
  return -1
}

test('3674 matches the breadth-first oracle on small arrays', () => {
  for (let n = 1; n <= 3; n++) {
    const total = 8 ** n
    for (let code = 0; code < total; code++) {
      const nums = Array.from({ length: n }, (_, i) => 1 + (Math.floor(code / 8 ** i) % 7))
      assert.equal(solve(nums), oracle(nums), `nums=${nums}`)
    }
  }
})
