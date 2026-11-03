import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).answers, run.result)
}

test('3919 hand-checked cases with the closest-neighbour rule', () => {
  assert.deepEqual(solve([1, 2, 4], [[0, 2]]), [3])
  assert.deepEqual(solve([1, 2, 4], [[2, 0]]), [2])
  assert.deepEqual(solve([1, 2, 4], [[1, 1]]), [0])
})

test('3919 frames are complete for the presets', () => {
  assertFrames(buildTrace({ nums: [2, 3, 7, 10, 20], queries: [[0, 4], [4, 1]] }))
})

test('3919 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[3,3],"queries":[[0,1]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[0,2]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[]}'))
})

// Oracle: Bellman-Ford over the same directed edges, rebuilt from the rule text.
function oracle(nums, queries) {
  const n = nums.length
  const edges = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) if (i !== j) edges.push([i, j, Math.abs(nums[i] - nums[j])])
    let pick = null
    for (const k of [i - 1, i + 1]) {
      if (k < 0 || k >= n) continue
      if (pick === null) pick = k
      else if (Math.abs(nums[i] - nums[k]) < Math.abs(nums[i] - nums[pick])) pick = k
      else if (Math.abs(nums[i] - nums[k]) === Math.abs(nums[i] - nums[pick]) && k < pick) pick = k
    }
    edges.push([i, pick, 1])
  }
  return queries.map(([s, e]) => {
    const dist = Array(n).fill(Infinity)
    dist[s] = 0
    for (let round = 0; round < n; round++) {
      for (const [a, b, w] of edges) if (dist[a] + w < dist[b]) dist[b] = dist[a] + w
    }
    return dist[e]
  })
}

test('3919 random strictly increasing arrays match Bellman-Ford', () => {
  let seed = 3919
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const size = 2 + rnd(6)
    const nums = []
    let value = rnd(5) - 2
    for (let i = 0; i < size; i++) { value += 1 + rnd(9); nums.push(value) }
    const queries = Array.from({ length: 3 }, () => [rnd(size), rnd(size)])
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})
