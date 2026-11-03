import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('2113 hand-checked walk through a cycle', () => {
  const nums = [1, 2, 3]
  assert.deepEqual(solve(nums, [[0, 0], [1, 1], [2, 0], [3, 0], [4, 0], [5, 1], [6, 2]]), [1, 3, 3, -1, 1, 2, 3])
  assert.deepEqual(solve(nums, [[4, 0], [5, 1], [3, 0], [6, 2], [2, 1]]), [1, 2, -1, 3, -1])
})

test('2113 single element and index past the end', () => {
  assert.deepEqual(solve([9], [[0, 0], [1, 0], [2, 0], [3, 0]]), [9, -1, 9, -1])
  assert.deepEqual(solve([9], [[0, 1]]), [-1])
})

test('2113 the parser rejects out-of-range data', () => {
  assert.throws(() => parseInput('{"nums":[],"queries":[]}'))
  assert.throws(() => parseInput('{"nums":[100],"queries":[]}'))
  assert.throws(() => parseInput('{"nums":[1],"queries":[[0]]}'))
  assert.throws(() => parseInput('{"nums":[1],"queries":[[0,10]]}'))
})

// Independent oracle: literally simulate the queue, second by second, from time 0.
function oracle(nums, queries) {
  const n = nums.length
  const states = [nums.slice()]
  let queue = nums.slice()
  for (let s = 1; s < 2 * n; s++) {
    if (s <= n) {
      queue = queue.slice(1)
    } else {
      queue = nums.slice(0, s - n)
    }
    states.push(queue.slice())
  }
  return queries.map(([t, i]) => {
    const arr = states[t % (2 * n)]
    return i < arr.length ? arr[i] : -1
  })
}

test('2113 random inputs match a literal simulation oracle', () => {
  let seed = 2113
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(99))
    const queries = Array.from({ length: rnd(7) }, () => [rnd(61), rnd(10)])
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})

test('2113 frame invariants hold', () => {
  const run = buildTrace({ nums: [5, 9, 2, 7], queries: [[0, 1], [3, 2], [5, 3], [9, 0]] })
  const codeLines = code.length
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= codeLines, f.phase)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, f.phase)
    assert.equal(typeof f.message, 'string')
    assert.ok(f.present.length <= 4)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('2113 the cycle length is twice the array length', () => {
  const run = buildTrace({ nums: [1, 2], queries: [] })
  assert.equal(run.frames[0].cycle, 4)
  assert.equal(run.frames.filter(f => f.phase === 'empty').length, 1)
})
