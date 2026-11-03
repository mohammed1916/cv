import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, rooks) => buildTrace({ n, rooks }).result

test('3189 presets', () => {
  assert.equal(solve(3, [[0, 0], [0, 1], [2, 2]]), 1)
  assert.equal(solve(1, [[0, 0]]), 0)
  assert.equal(solve(5, [[4, 4], [4, 3], [4, 2], [4, 1], [4, 0]]), 10)
})

test('3189 rejects malformed boards', () => {
  assert.throws(() => parseInput('{"n":2,"rooks":[[0,0]]}'))
  assert.throws(() => parseInput('{"n":2,"rooks":[[0,2],[1,1]]}'))
})

// Oracle: try every target row permutation and column permutation (small n only).
function oracle(n, rooks) {
  let best = Infinity
  const perms = []
  const build = (prefix, rest) => { if (!rest.length) { perms.push(prefix); return } rest.forEach((v, i) => build([...prefix, v], rest.filter((_, j) => j !== i))) }
  build([], Array.from({ length: n }, (_, i) => i))
  for (const R of perms) for (const C of perms) {
    let cost = 0
    rooks.forEach(([r, c], i) => { cost += Math.abs(r - R[i]) + Math.abs(c - C[i]) })
    best = Math.min(best, cost)
  }
  return best
}

test('3189 random boards match a permutation oracle', () => {
  let seed = 3189
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(5)
    const rooks = Array.from({ length: n }, () => [rnd(n), rnd(n)])
    assert.equal(solve(n, rooks), oracle(n, rooks), JSON.stringify({ n, rooks }))
  }
})

test('3189 frames carry valid pseudocode and Python lines', () => {
  const pyLines = python.split('\n').length
  for (const { n, rooks } of [{ n: 4, rooks: [[3, 0], [3, 1], [0, 3], [0, 2]] }, { n: 3, rooks: [[0, 0], [0, 1], [2, 2]] }]) {
    const run = buildTrace({ n, rooks })
    if (n === 4) assert.equal(run.result, 2)
    for (const f of run.frames) {
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
      assert.equal(typeof f.message, 'string')
    }
    assert.equal(run.frames.at(-1).total, run.result)
  }
})
