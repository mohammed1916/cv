import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, examples, phases, code, python } from './algorithm.js'

const solve = (m, n, waitCost) => buildTrace({ m, n, waitCost }).result

test('3603 hand-computed grids', () => {
  // (0,0) (1,0) (1,1) (2,1) (2,2): 1 + 2 + 4 + 4 + 3 + 6 + 2 + 9
  assert.equal(solve(3, 3, [[2, 7, 1], [4, 3, 8], [6, 2, 5]]), 31)
  // Forced walk: 1, enter 2, wait 0, enter 3.
  assert.equal(solve(1, 3, [[5, 0, 9]]), 6)
  // Single column: 1, enter 2, wait 7, enter 3.
  assert.equal(solve(3, 1, [[100], [7], [100]]), 13)
  // Right then down: 1 + 2 + 4 + 4 = 11; down then right: 1 + 2 + 1 + 4 = 8.
  assert.equal(solve(2, 2, [[9, 4], [1, 9]]), 8)
  // The first and last waits are never charged.
  assert.equal(solve(1, 2, [[50000, 70000]]), 3)
})

// Oracle: walk every route with an explicit clock, paying moves on odd seconds and waits on even ones.
function clockOracle(m, n, waitCost) {
  let best = Infinity
  const walk = (i, j, second, total) => {
    if (i === m - 1 && j === n - 1) { best = Math.min(best, total); return }
    if (second % 2 === 0) { walk(i, j, second + 1, total + waitCost[i][j]); return }
    if (i + 1 < m) walk(i + 1, j, second + 1, total + (i + 2) * (j + 1))
    if (j + 1 < n) walk(i, j + 1, second + 1, total + (i + 1) * (j + 2))
  }
  walk(0, 0, 1, 1)
  return best
}

test('3603 random grids match a second-by-second walk of every route', () => {
  let seed = 3603
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  for (let t = 0; t < 400; t++) {
    const m = 1 + rnd(5)
    const n = 1 + rnd(5)
    if (m * n < 2) continue
    const limit = [3, 30, 3000][rnd(3)]
    const waitCost = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(limit)))
    assert.equal(solve(m, n, waitCost), clockOracle(m, n, waitCost), JSON.stringify({ m, n, waitCost }))
  }
})

test('3603 the replayed ledger adds up to the answer and alternates', () => {
  let seed = 19
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  const inputs = examples.map(e => parseInput(e.input))
  for (let t = 0; t < 100; t++) {
    const m = 1 + rnd(5)
    const n = 2 + rnd(4)
    inputs.push({ m, n, waitCost: Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(40))) })
  }
  for (const input of inputs) {
    const { frames, result } = buildTrace(input)
    const last = frames.at(-1)
    assert.equal(last.phase, 'walk')
    assert.equal(last.total, result)
    assert.equal(last.ledger.reduce((sum, e) => sum + e.amount, 0), result)
    last.ledger.slice(1).forEach(entry => assert.equal(entry.kind, entry.second % 2 === 1 ? 'move' : 'wait'))
    assert.deepEqual(last.ledger.at(-1).at, [input.m - 1, input.n - 1])
    assert.equal(last.ledger.at(-1).kind, 'move')
  }
})

test('3603 parseInput enforces the shape', () => {
  assert.throws(() => parseInput('{"m":1,"n":1,"waitCost":[[1]]}'))
  assert.throws(() => parseInput('{"m":2,"n":2,"waitCost":[[1,1]]}'))
  assert.throws(() => parseInput('{"m":1,"n":2,"waitCost":[[1,-1]]}'))
  assert.throws(() => parseInput('{"m":7,"n":6,"waitCost":[]}'))
})

test('3603 frames are well formed and each settled cell uses its offers', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n')
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const { frames } = buildTrace(parseInput(example.input))
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines.length)
      assert.ok(f.message.length > 0)
      if (f.phase === 'settle') {
        const [i, j] = f.cell
        const offers = [f.above, f.left].filter(Boolean).map(o => o.total)
        assert.equal(f.cost[i][j], Math.min(...offers) + (i + 1) * (j + 1))
      }
    }
  }
})
