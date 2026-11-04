import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (parent, gates, queries) => buildTrace({ parent, gates, queries }).result

test('3973 hand-computed chain', () => {
  const parent = [-1, 0, 1]
  const gates = [[0, 0, 0], [2, 1, 1], [1, 3, 2]]
  // Red at 2: 1 stays red, 2 flip to blue. At 1: red has 2+1 moves, blue has 1+1. 1*3 + 2*2 = 7; Bob at the LCA gives 1.
  assert.equal(solve(parent, gates, [[2, 1, 0, 0]]), 7)
  // Blue at 2: 3+2 = 5 to reach node 1; Bob already there.
  assert.equal(solve(parent, gates, [[2, 0, 1, 1]]), 5)
  assert.equal(solve(parent, gates, [[2, 1, 0, 0], [2, 0, 1, 1]]), 7 ^ 5)
})

test('3973 hand-computed siblings multiply', () => {
  // Alice at 1 red: 2 red + 1 white = 3. Bob at 2 blue: 4 blue + 2 white = 6. 3 * 6 = 18.
  assert.equal(solve([-1, 0, 0], [[0, 0, 0], [2, 5, 1], [7, 4, 2]], [[1, 1, 2, 0]]), 18)
})

test('3973 edge cases: same node, ancestor, no usable gate', () => {
  assert.equal(solve([-1, 0], [[2, 2, 2], [1, 1, 1]], [[1, 0, 1, 1]]), 1)
  assert.equal(solve([-1, 0], [[2, 2, 2], [1, 1, 1]], [[0, 0, 1, 1]]), 2)
  assert.equal(solve([-1, 0, 0], [[1, 1, 1], [3, 0, 0], [0, 2, 1]], [[1, 0, 2, 0]]), 0)
  // A flip into a colour with no onward gate strands that branch only.
  assert.equal(solve([-1, 0, 1], [[0, 0, 0], [0, 4, 0], [0, 1, 1]], [[2, 0, 0, 0]]), 4)
})

test('3973 parents need not be smaller than their children', () => {
  // Tree 0 <- 2 <- 1. Blue at 1: 2 ways, staying blue 1 and flipping to red 1. At 2: blue 3, red 5. 1*3 + 1*5 = 8.
  assert.equal(solve([-1, 2, 0], [[0, 0, 0], [0, 1, 1], [5, 3, 0]], [[1, 0, 0, 1]]), 8)
})

// Oracle: enumerate all reachable (node, card) walks with no matrices and no lifting.
function oracle(parent, gates, queries) {
  const MOD = 1000000007n
  const chain = v => { const c = [v]; while (parent[c.at(-1)] !== -1) c.push(parent[c.at(-1)]); return c }
  const count = (v, card, top) => {
    if (v === top) return 1n
    const [red, blue, white] = gates[v]
    const same = BigInt(card === 1 ? red : blue)
    let total = 0n
    if (same) total += same * count(parent[v], card, top)
    if (white) total += BigInt(white) * count(parent[v], 1 - card, top)
    return total
  }
  let answer = 0n
  for (const [a, ca, b, cb] of queries) {
    const seen = new Set(chain(a))
    const top = chain(b).find(v => seen.has(v))
    answer ^= count(a, ca, top) * count(b, cb, top) % MOD
  }
  return Number(answer)
}

test('3973 random trees match a recursive walk oracle', () => {
  let seed = 3973
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const perm = Array.from({ length: n - 1 }, (_, i) => i + 1)
    for (let i = perm.length - 1; i > 0; i--) { const j = rnd(i + 1); [perm[i], perm[j]] = [perm[j], perm[i]] }
    const parent = Array(n).fill(-1)
    const placed = [0]
    for (const v of perm) { parent[v] = placed[rnd(placed.length)]; placed.push(v) }
    const gates = Array.from({ length: n }, () => [rnd(4), rnd(4), rnd(3)])
    const queries = Array.from({ length: 1 + rnd(6) }, () => [rnd(n), rnd(2), rnd(n), rnd(2)])
    assert.equal(solve(parent, gates, queries), oracle(parent, gates, queries), JSON.stringify({ parent, gates, queries }))
  }
})

test('3973 a long chain with large counts stays correct modulo the prime', () => {
  const n = 15
  const parent = Array.from({ length: n }, (_, i) => i - 1)
  const gates = Array.from({ length: n }, () => [10, 10, 10])
  const queries = [[14, 1, 0, 0]]
  // Every step offers 20 gate choices whichever card is held: 20^14 mod the prime.
  let expected = 1n
  for (let i = 0; i < 14; i++) expected = expected * 20n % 1000000007n
  assert.equal(solve(parent, gates, queries), Number(expected))
  assert.equal(oracle(parent, gates, queries), Number(expected))
})

test('3973 parseInput rejects invalid trees and queries', () => {
  const ok = { parent: [-1, 0], gates: [[0, 0, 0], [1, 1, 1]], queries: [[1, 0, 0, 1]] }
  assert.doesNotThrow(() => parseInput(JSON.stringify(ok)))
  assert.throws(() => parseInput(JSON.stringify({ ...ok, parent: [0, 0] })))
  assert.throws(() => parseInput(JSON.stringify({ ...ok, parent: [-1, 2, 1], gates: [[0, 0, 0], [1, 1, 1], [1, 1, 1]] })))
  assert.throws(() => parseInput(JSON.stringify({ ...ok, gates: [[0, 0, 11], [1, 1, 1]] })))
  assert.throws(() => parseInput(JSON.stringify({ ...ok, queries: [[1, 2, 0, 1]] })))
  assert.throws(() => parseInput(JSON.stringify({ ...ok, queries: [[5, 0, 0, 1]] })))
})

test('3973 frames: LCA stays hidden until found, climbs follow binary jumps, lines are real', () => {
  const parent = [-1, 0, 1, 2, 3, 4]
  const gates = [[1, 1, 1], [2, 1, 3], [1, 4, 1], [3, 0, 2], [2, 2, 2], [1, 3, 1]]
  const { frames, result } = buildTrace({ parent, gates, queries: [[5, 1, 0, 0]] })
  assert.equal(frames.find(f => f.phase === 'query').q.top, undefined)
  const jumps = frames.filter(f => f.phase === 'climb' && f.matrix)
  assert.deepEqual(jumps.map(f => f.jump), [{ from: 5, to: 4 }, { from: 4, to: 0 }]) // 5 = 1 + 4
  assert.equal(frames.at(-1).answer, result)
  assert.equal(frames.filter(f => f.phase === 'combine').at(-1).rows[0].LCA, 0)
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const f of frames) {
    assert.ok(ids.has(f.phase) && f.message)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1]?.trim())
  }
})
