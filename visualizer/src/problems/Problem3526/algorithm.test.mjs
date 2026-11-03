import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('3526 worked presets', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5], [[3, 0, 4], [2, 0, 2], [2, 1, 3]]), [5 ^ 4 ^ 3, 4 ^ 3 ^ 2])
  assert.deepEqual(solve([6, 1, 8], [[1, 1, 9], [2, 0, 2], [3, 0, 1], [2, 0, 0]]), [6 ^ 9 ^ 8, 9])
  assert.deepEqual(solve([7], [[2, 0, 0]]), [7])
})

test('3526 edge cases', () => {
  assert.deepEqual(solve([4, 4], [[3, 0, 1]]), [])
  assert.deepEqual(solve([4, 4], [[2, 0, 1], [1, 0, 0], [2, 0, 1]]), [0, 4])
})

test('3526 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[2,1,0]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[4,0,1]]}'))
  assert.throws(() => parseInput('{"nums":[16],"queries":[[2,0,0]]}'))
})

// Oracle: use the built-in array operations instead of the traced loops.
function oracle(nums0, queries) {
  const nums = nums0.slice()
  const out = []
  for (const [kind, a, b] of queries) {
    if (kind === 1) nums[a] = b
    else if (kind === 2) out.push(nums.slice(a, b + 1).reduce((x, y) => x ^ y, 0))
    else nums.splice(a, b - a + 1, ...nums.slice(a, b + 1).reverse())
  }
  return out
}

test('3526 random inputs match a built-in-operations oracle', () => {
  let seed = 3526
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(7)
    const nums = Array.from({ length: n }, () => rnd(16))
    const queries = Array.from({ length: 1 + rnd(6) }, () => {
      const kind = 1 + rnd(3)
      if (kind === 1) return [1, rnd(n), rnd(16)]
      const a = rnd(n)
      return [kind, a, a + rnd(n - a)]
    })
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})

test('3526 frames keep pseudocode and python line references inside range', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ nums: [1, 2, 3, 4, 5], queries: [[3, 0, 4], [2, 0, 2]] })
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
