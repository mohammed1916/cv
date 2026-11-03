import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (prices, roads) => buildTrace({ prices, roads }).result

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

test('3928 hand-checked cases', () => {
  assert.deepEqual(solve([7], []), [7])
  assert.deepEqual(solve([5, 1], [[0, 1, 3, 2]]), [5, 1])
  assert.deepEqual(solve([1, 100], [[0, 1, 1, 10]]), [1, 12])
})

test('3928 frames are complete for the presets', () => {
  assertFrames(buildTrace({ prices: [5, 2, 9, 4], roads: [[0, 1, 3, 2], [1, 2, 1, 4], [2, 3, 2, 1], [0, 3, 10, 1]] }))
})

test('3928 rejects bad input', () => {
  assert.throws(() => parseInput('{"prices":[1,2],"roads":[[0,0,1,1]]}'))
  assert.throws(() => parseInput('{"prices":[1,2],"roads":[[0,1,1,1],[1,0,2,2]]}'))
  assert.throws(() => parseInput('{"prices":[1],"roads":[]}'))
})

// Oracle: Floyd-Warshall twice, once for empty costs and once for carrying costs.
function oracle(prices, roads) {
  const n = prices.length
  const floyd = weight => {
    const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
    for (const [a, b, cost, mult] of roads) {
      const w = weight(cost, mult)
      d[a][b] = Math.min(d[a][b], w)
      d[b][a] = Math.min(d[b][a], w)
    }
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
    return d
  }
  const empty = floyd((c) => c)
  const carry = floyd((c, m) => c * m)
  return prices.map((_, s) => Math.min(...prices.map((p, j) => p + empty[s][j] + carry[j][s])))
}

test('3928 random small graphs match Floyd-Warshall', () => {
  let seed = 3928
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rnd(5)
    const prices = Array.from({ length: n }, () => 1 + rnd(20))
    const roads = []
    const used = new Set()
    for (let k = 0; k < rnd(8); k++) {
      const a = rnd(n)
      const b = rnd(n)
      const key = `${Math.min(a, b)},${Math.max(a, b)}`
      if (a === b || used.has(key)) continue
      used.add(key)
      roads.push([a, b, 1 + rnd(9), 1 + rnd(4)])
    }
    assert.deepEqual(solve(prices, roads), oracle(prices, roads), JSON.stringify({ prices, roads }))
  }
})
