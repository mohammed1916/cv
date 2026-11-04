import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, maxDiff, queries) => buildTrace({ nums, maxDiff, queries }).result

test('3534 hand-computed cases', () => {
  assert.deepEqual(solve([14, 2, 9, 5, 18, 11, 30], 5, [[1, 4], [0, 2], [1, 6], [3, 3]]), [4, 1, -1, 0])
  assert.deepEqual(solve([0, 3, 6, 9, 12, 15, 18, 21, 24], 4, [[0, 8], [5, 1], [2, 3]]), [8, 4, 1])
  assert.deepEqual(solve([6, 6, 40], 0, [[0, 1], [1, 2], [2, 2]]), [1, -1, 0])
  assert.deepEqual(solve([3], 0, [[0, 0]]), [0])
  assert.deepEqual(solve([1, 2], 0, [[0, 1], [1, 0]]), [-1, -1])
  assert.deepEqual(solve([1, 2], 1, [[1, 0]]), [1])
})

test('3534 parseInput enforces the domain', () => {
  assert.throws(() => parseInput('{"nums":[],"maxDiff":1,"queries":[[0,0]]}'))
  assert.throws(() => parseInput('{"nums":[1],"maxDiff":-1,"queries":[[0,0]]}'))
  assert.throws(() => parseInput('{"nums":[1],"maxDiff":1,"queries":[[0,1]]}'))
  assert.throws(() => parseInput('{"nums":[100001],"maxDiff":1,"queries":[[0,0]]}'))
  assert.throws(() => parseInput('{"nums":[1],"maxDiff":1,"queries":[]}'))
  assert.throws(() => parseInput(`{"nums":[${new Array(13).fill(1).join(',')}],"maxDiff":1,"queries":[[0,0]]}`))
})

// Oracle: breadth-first search on the explicit graph.
function bfs(nums, maxDiff, from, to) {
  const dist = new Array(nums.length).fill(-1)
  dist[from] = 0
  const queue = [from]
  for (const u of queue) {
    for (let v = 0; v < nums.length; v++) {
      if (dist[v] < 0 && Math.abs(nums[u] - nums[v]) <= maxDiff) {
        dist[v] = dist[u] + 1
        queue.push(v)
      }
    }
  }
  return dist[to]
}

test('3534 every pair on random graphs matches BFS', () => {
  let seed = 3534
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 400; round++) {
    const n = 1 + rnd(12)
    const span = 1 + rnd(40)
    const nums = Array.from({ length: n }, () => rnd(span))
    const maxDiff = rnd(8)
    const queries = []
    for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) queries.push([u, v])
    assert.deepEqual(solve(nums, maxDiff, queries), queries.map(([u, v]) => bfs(nums, maxDiff, u, v)), JSON.stringify({ nums, maxDiff }))
  }
})

test('3534 the jump table is consistent', () => {
  const { frames } = buildTrace({ nums: [0, 3, 6, 9, 12, 15, 18, 21, 24], maxDiff: 4, queries: [[0, 8]] })
  const { lift, sorted } = frames.at(-1)
  assert.equal(lift.length, 4)
  for (let p = 0; p < sorted.length; p++) {
    assert.ok(sorted[lift[0][p]] - sorted[p] <= 4)
    if (lift[0][p] + 1 < sorted.length) assert.ok(sorted[lift[0][p] + 1] - sorted[p] > 4)
    for (let k = 1; k < lift.length; k++) assert.equal(lift[k][p], lift[k - 1][lift[k - 1][p]])
  }
})

test('3534 frames map to real lines and walk every phase', () => {
  const lines = python.split('\n')
  const { frames } = buildTrace({ nums: [14, 2, 9, 5, 18, 11, 30], maxDiff: 5, queries: [[1, 4], [0, 2], [1, 6], [3, 3]] })
  assert.equal(frames[0].phase, 'sort')
  assert.equal(frames.at(-1).phase, 'done')
  for (const phase of ['sort', 'window', 'lift', 'query', 'test', 'jump', 'answer', 'done']) assert.ok(frames.some(f => f.phase === phase), phase)
  for (const frame of frames) {
    assert.ok(code[frame.activeLine - 1])
    assert.ok(lines[frame.pythonLine - 1]?.trim())
    assert.ok(frame.message)
  }
  for (const frame of frames.filter(f => f.phase === 'jump')) assert.ok(frame.a < frame.b)
})
