import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, code, parseInput, phases, python } from './algorithm.js'

const solve = (n, calls) => buildTrace({ n, calls }).result
const set = (x, y, z) => ['setCell', x, y, z]
const unset = (x, y, z) => ['unsetCell', x, y, z]
const Q = ['largestMatrix']

// Independent oracle: real 3D array, counted from scratch on every query.
function oracle(n, calls) {
  const g = Array.from({ length: n }, () => Array.from({ length: n }, () => Array(n).fill(0)))
  return calls.map(([name, x, y, z]) => {
    if (name === 'setCell') { g[x][y][z] = 1; return null }
    if (name === 'unsetCell') { g[x][y][z] = 0; return null }
    let best = -1, at = -1
    g.forEach((layer, i) => {
      const c = layer.flat().reduce((a, b) => a + b, 0)
      if (c >= best) { best = c; at = i }
    })
    return at
  })
}

test('3391 hand-computed: tie and an old entry', () => {
  assert.deepEqual(
    solve(3, [set(2, 0, 1), set(1, 1, 1), set(1, 2, 2), Q, set(2, 2, 0), Q, unset(2, 2, 0), Q]),
    [null, null, null, 1, null, 2, null, 1],
  )
})

test('3391 hand-computed: repeats do not change counts, empty grid gives n-1', () => {
  assert.deepEqual(
    solve(2, [Q, set(0, 1, 1), set(0, 1, 1), Q, unset(0, 1, 1), unset(0, 1, 1), Q]),
    [1, null, null, 0, null, null, 1],
  )
  assert.deepEqual(solve(4, [Q, unset(0, 0, 0), Q]), [3, null, 3])
  assert.deepEqual(solve(1, [Q, set(0, 0, 0), Q]), [0, null, 0])
})

test('3391 oracle on random call lists', () => {
  let seed = 5
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(6)
    const calls = Array.from({ length: 1 + rand(24) }, () => {
      const kind = rand(3)
      if (kind === 2) return Q
      const cell = [rand(n), rand(Math.min(n, 2)), rand(Math.min(n, 2))]
      return kind === 0 ? set(...cell) : unset(...cell)
    })
    assert.deepEqual(solve(n, calls), oracle(n, calls))
  }
})

test('3391 discards an out-of-date top entry and records it', () => {
  const run = buildTrace({ n: 2, calls: [set(0, 0, 0), set(0, 0, 1), unset(0, 0, 0), unset(0, 0, 1), Q] })
  assert.equal(run.result.at(-1), 1)
  assert.ok(run.frames.some(f => f.phase === 'stale' && f.top.x === 0))
})

test('3391 parseInput validates', () => {
  assert.equal(parseInput('{"n":2,"calls":[["largestMatrix"]]}').n, 2)
  assert.throws(() => parseInput('{"n":0,"calls":[["largestMatrix"]]}'))
  assert.throws(() => parseInput('{"n":7,"calls":[["largestMatrix"]]}'))
  assert.throws(() => parseInput('{"n":2,"calls":[["setCell",2,0,0]]}'))
  assert.throws(() => parseInput('{"n":2,"calls":[["setCell",0,0]]}'))
  assert.throws(() => parseInput('{"n":2,"calls":[["flip",0,0,0]]}'))
  assert.throws(() => parseInput('{"n":2,"calls":[]}'))
})

test('3391 frames are consistent', () => {
  const run = buildTrace({ n: 3, calls: [set(2, 0, 1), set(1, 1, 1), set(1, 2, 2), Q, set(2, 2, 0), Q, unset(2, 2, 0), Q] })
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines.length)
    assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
    assert.ok(f.message.length > 0)
    assert.ok(f.heap && f.heap.items.length >= 3)
    assert.equal(f.count.reduce((a, b) => a + b, 0), f.on.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  const answers = run.frames.filter(f => f.phase === 'answer').map(f => f.answer)
  assert.deepEqual(answers, [1, 2, 1])
})
