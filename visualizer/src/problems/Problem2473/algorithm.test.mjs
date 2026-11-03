import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

function checkFrames(run) {
  const phases = new Set(['build', 'start', 'pick', 'settle', 'relax', 'candidate', 'append', 'done'])
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(phases.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.answer))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

// Independent oracle: Floyd-Warshall distances, then try every destination for every start.
function oracle({ n, roads, apple_cost, k }) {
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  for (const [a, b, w] of roads) { d[a][b] = Math.min(d[a][b], w); d[b][a] = Math.min(d[b][a], w) }
  for (let m = 0; m < n; m++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][m] + d[m][j])
  return Array.from({ length: n }, (_, s) => Math.min(...Array.from({ length: n }, (_, j) => apple_cost[j] + (k + 1) * d[s][j])))
}

test('2473 local presets are hand-checked', () => {
  assert.deepEqual(solve({ n: 4, roads: [[0, 1, 2], [1, 2, 1], [2, 3, 3]], apple_cost: [9, 2, 7, 1], k: 2 }), [8, 2, 5, 1])
  assert.deepEqual(solve({ n: 3, roads: [[0, 1, 1]], apple_cost: [5, 4, 1], k: 1 }), [5, 4, 1])
})

test('2473 a single city buys locally', () => {
  assert.deepEqual(solve({ n: 1, roads: [], apple_cost: [7], k: 5 }), [7])
})

test('2473 returning is charged k times the road cost', () => {
  // Out costs 3 and back costs 3k: total apple 1 + (k+1)*3 from city 1 to city 0 beats buying at 0 only when cheaper.
  assert.deepEqual(solve({ n: 2, roads: [[0, 1, 3]], apple_cost: [50, 1], k: 2 }), [10, 1])
})

test('2473 random graphs match Floyd-Warshall oracle', () => {
  let seed = 2473
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const roads = []
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rnd(3) === 0) roads.push([i, j, 1 + rnd(9)])
    const input = { n, roads, apple_cost: Array.from({ length: n }, () => 1 + rnd(30)), k: 1 + rnd(4) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})

test('2473 frame invariants hold for presets and random inputs', () => {
  checkFrames(buildTrace(parseInput('{"n":5,"roads":[[0,1,4],[0,2,1],[2,3,2],[3,4,5],[1,4,1]],"apple_cost":[8,6,20,3,7],"k":3}')))
  checkFrames(buildTrace({ n: 1, roads: [], apple_cost: [7], k: 5 }))
})

test('2473 rejects malformed input', () => {
  assert.throws(() => parseInput('{"n":2,"roads":[[0,0,1]],"apple_cost":[1,1],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"roads":[],"apple_cost":[1],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"roads":[],"apple_cost":[1,1],"k":0}'))
})
