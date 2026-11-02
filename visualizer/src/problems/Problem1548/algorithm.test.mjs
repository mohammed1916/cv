import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, roads, names, targetPath) => buildTrace({ n, roads, names, targetPath }).result

function checkFrames(trace) {
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

// Mismatches of a vertex walk, or Infinity if it is not a walk over the roads.
function walkCost(path, roads, names, targetPath) {
  if (path.length !== targetPath.length) return Infinity
  const edge = (a, b) => roads.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
  for (let k = 1; k < path.length; k++) if (!edge(path[k - 1], path[k])) return Infinity
  return path.reduce((sum, v, k) => sum + (names[v] === targetPath[k] ? 0 : 1), 0)
}

// Oracle: enumerate every vertex sequence of the target length.
function oracle(n, roads, names, targetPath) {
  let best = Infinity
  const walk = path => {
    if (path.length === targetPath.length) {
      best = Math.min(best, walkCost(path, roads, names, targetPath))
      return
    }
    for (let v = 0; v < n; v++) walk([...path, v])
  }
  walk([])
  return best
}

test('1548 worked examples', () => {
  assert.deepEqual(solve(2, [[0, 1]], ['A', 'B'], ['A', 'B', 'A']), [0, 1, 0])
  assert.deepEqual(solve(3, [[0, 1], [1, 2]], ['x', 'y', 'z'], ['y']), [1])
  const trace = buildTrace({
    n: 5,
    roads: [[0, 2], [0, 3], [1, 2], [1, 3], [1, 4], [2, 4]],
    names: ['ATL', 'PEK', 'SHA', 'DXB', 'HND'],
    targetPath: ['ATL', 'DXB', 'HND', 'LAX'],
  })
  assert.equal(walkCost(trace.result, [[0, 2], [0, 3], [1, 2], [1, 3], [1, 4], [2, 4]], ['ATL', 'PEK', 'SHA', 'DXB', 'HND'], ['ATL', 'DXB', 'HND', 'LAX']), oracle(5, [[0, 2], [0, 3], [1, 2], [1, 3], [1, 4], [2, 4]], ['ATL', 'PEK', 'SHA', 'DXB', 'HND'], ['ATL', 'DXB', 'HND', 'LAX']))
  checkFrames(trace)
})

test('1548 vertices may repeat across positions but consecutive ones must be adjacent', () => {
  // A single edge: the only walks alternate 0 and 1, so the target must alternate too.
  assert.deepEqual(solve(2, [[0, 1]], ['A', 'B'], ['A', 'A', 'A']), [0, 1, 0])
})

test('1548 random graphs match an exhaustive oracle', () => {
  let seed = 1548
  const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 16) % k }
  const letters = ['A', 'B', 'C']
  for (let trial = 0; trial < 200; trial++) {
    const n = 2 + rand(4)
    const roads = []
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (rand(3) > 0) roads.push([a, b])
    if (roads.length === 0) roads.push([0, 1])
    const names = Array.from({ length: n }, () => letters[rand(3)])
    const targetPath = Array.from({ length: 1 + rand(4) }, () => letters[rand(3)])
    const expected = oracle(n, roads, names, targetPath)
    const result = solve(n, roads, names, targetPath)
    if (expected === Infinity) {
      assert.deepEqual(result, [])
    } else {
      assert.equal(walkCost(result, roads, names, targetPath), expected, JSON.stringify({ n, roads, names, targetPath, result }))
    }
  }
})

test('1548 rejects a self-loop and a missing name', () => {
  assert.throws(() => parseInput('{"n":2,"roads":[[0,0]],"names":["A","B"],"targetPath":["A"]}'))
  assert.throws(() => parseInput('{"n":2,"roads":[[0,1]],"names":["A"],"targetPath":["A"]}'))
})
