import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, limit) => buildTrace(parseInput(JSON.stringify({ nums, limit }))).result
const PY = python.split('\n')

test('2948 worked examples', () => {
  assert.deepEqual(solve([9, 3, 7, 4, 8], 2), [7, 3, 8, 4, 9])
  assert.deepEqual(solve([1, 7, 3, 5], 0), [1, 7, 3, 5])
})

test('2948 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [5, 1, 3], limit: 2 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2948 rejects bad limits', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"limit":-1}'))
})

// Oracle: take positions in order and give each the smallest unused value from its swap component.
function oracle(nums, limit) {
  const n = nums.length
  const parent = nums.map((_, i) => i)
  const find = x => (parent[x] === x ? x : find(parent[x]))
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(nums[i] - nums[j]) <= limit) parent[find(i)] = find(j)
  const pools = new Map()
  for (let i = 0; i < n; i++) pools.set(find(i), [...(pools.get(find(i)) ?? []), nums[i]].sort((p, q) => p - q))
  return nums.map((_, i) => pools.get(find(i)).shift())
}

test('2948 random arrays match a component oracle', () => {
  let seed = 2948
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(20))
    const limit = rnd(6)
    assert.deepEqual(solve(nums, limit), oracle(nums, limit), JSON.stringify({ nums, limit }))
  }
})
