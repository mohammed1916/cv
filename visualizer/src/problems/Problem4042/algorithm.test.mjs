import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, start, q) => buildTrace({ nums, k, start, q }).result

test('4042 hand-checked queries', () => {
  assert.deepEqual(solve([1, 1, 2, 2], 2, [0, 3], 2), [true, true])
  assert.deepEqual(solve([1, 2, 2, 3], 1, [0, 3], 2), [false, false])
  assert.deepEqual(solve([5, 5], 1, [0, 0], 1), [false])
})

test('4042 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":1,"start":[1,0],"q":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":0,"start":[0,1],"q":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":1,"start":[0,1],"q":13}'))
})

// Oracle: each query's range is checked from scratch with a Map and the endpoint rule applied separately.
function oracle(nums, k, start, q) {
  const n = nums.length
  let [l, r] = start
  const out = []
  for (let i = 0; i < q; i++) {
    const m = new Map()
    for (let j = l; j <= r; j++) m.set(nums[j], (m.get(nums[j]) || 0) + 1)
    const ok = m.size === k && [...m.values()].every(c => c % 2 === 0)
    out.push(ok)
    const g = ok ? l + r : r - l
    const x = (l ^ g) % n
    const y = (r ^ g) % n
    l = Math.min(x, y)
    r = Math.max(x, y)
  }
  return out
}

test('4042 random queries match the recount oracle', () => {
  let seed = 4042
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(10)
    const nums = Array.from({ length: n }, () => rnd(4))
    const k = 1 + rnd(3)
    const a = rnd(n)
    const b = a + rnd(n - a)
    const q = 1 + rnd(8)
    assert.deepEqual(solve(nums, k, [a, b], q), oracle(nums, k, [a, b], q), JSON.stringify({ nums, k, a, b, q }))
  }
})
