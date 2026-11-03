import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k, queries) => buildTrace({ nums, k, queries }).result

test('4033 smallest legal range and single distinct value', () => {
  assert.deepEqual(solve([1, 1], 1, [[0, 1]]), [true])
  assert.deepEqual(solve([1, 2], 1, [[0, 1]]), [false])
  assert.deepEqual(solve([3, 3, 3, 3], 1, [[0, 3]]), [true])
  assert.deepEqual(solve([3, 3, 3], 1, [[0, 2]]), [false])
})

test('4033 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace({ nums: [2, 2, 5, 5], k: 2, queries: [[0, 3]] })
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4033 rejects malformed ranges', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":1,"queries":[[1,1]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":1,"queries":[[0,2]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":3,"queries":[[0,1]]}'))
})

// Independent oracle: build the frequency map with a Set and a filter, not with the trace's incremental counts.
function oracle(nums, k, queries) {
  return queries.map(([l, r]) => {
    const part = nums.slice(l, r + 1)
    const distinct = new Set(part).size
    const allEven = [...new Set(part)].every(v => part.filter(x => x === v).length % 2 === 0)
    return distinct === k && allEven
  })
}

test('4033 random inputs match a direct oracle', () => {
  let seed = 4033
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const nums = Array.from({ length: n }, () => 1 + rnd(4))
    const k = 1 + rnd(n)
    const queries = Array.from({ length: 1 + rnd(4) }, () => {
      const l = rnd(n - 1)
      const r = l + 1 + rnd(n - 1 - l)
      return [l, r]
    })
    assert.deepEqual(solve(nums, k, queries), oracle(nums, k, queries), JSON.stringify({ nums, k, queries }))
  }
})
