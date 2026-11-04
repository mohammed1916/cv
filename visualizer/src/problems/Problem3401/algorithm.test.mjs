import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, code, phases, sql } from './algorithm.js'

const table = rows => rows.map(([giver_id, receiver_id, gift_value]) => ({ giver_id, receiver_id, gift_value }))
const run = rows => buildTrace({ SecretSanta: table(rows) }).result
const chain = (chain_id, chain_length, total_gift_value) => ({ chain_id, chain_length, total_gift_value })

test('3401 hand-computed loop of four and a swap', () => {
  assert.deepEqual(run([[3, 8, 15], [8, 6, 10], [6, 11, 5], [11, 3, 12], [20, 21, 9], [21, 20, 16]]), [chain(1, 4, 42), chain(2, 2, 25)])
})

test('3401 equal combinations merge and ties sort by total', () => {
  assert.deepEqual(run([[1, 2, 10], [2, 1, 30], [5, 6, 25], [6, 5, 15]]), [chain(1, 2, 40)])
  assert.deepEqual(run([[1, 2, 1], [2, 1, 1], [5, 6, 25], [6, 5, 15]]), [chain(1, 2, 40), chain(2, 2, 2)])
})

test('3401 open lines and empty tables give no chain', () => {
  assert.deepEqual(run([[9, 4, 50]]), [])
  assert.deepEqual(run([]), [])
  assert.deepEqual(run([[31, 32, 8], [32, 33, 4], [40, 41, 7], [41, 40, 2]]), [chain(1, 2, 9)])
})

test('3401 parseInput rejects what the rules forbid', () => {
  const p = rows => parseInput(JSON.stringify({ SecretSanta: table(rows) }))
  assert.throws(() => p([[1, 1, 5]]))
  assert.throws(() => p([[1, 2, 5], [1, 3, 5]]))
  assert.throws(() => p([[1, 3, 5], [2, 3, 5]]))
  assert.throws(() => parseInput('{}'))
  assert.throws(() => parseInput(JSON.stringify({ SecretSanta: Array.from({ length: 13 }, (_, i) => ({ giver_id: i, receiver_id: i + 100, gift_value: 1 })) })))
  assert.doesNotThrow(() => p([[1, 2, 5], [2, 1, 5]]))
})

// Oracle: mark visited employees and walk each unvisited one once, instead of walking from every row.
function oracle(rows) {
  const next = new Map(rows.map(([g, r, v]) => [g, [r, v]]))
  const visited = new Set()
  const combos = new Map()
  for (const [g] of rows) {
    if (visited.has(g)) continue
    const here = new Set()
    let at = g, hops = 0, total = 0
    while (next.has(at) && !here.has(at)) {
      here.add(at)
      const [r, v] = next.get(at)
      at = r
      hops++
      total += v
    }
    for (const x of here) visited.add(x)
    if (at === g && next.has(g) && hops > 0) combos.set(`${hops}|${total}`, [hops, total])
  }
  return [...combos.values()].sort((a, b) => b[0] - a[0] || b[1] - a[1]).map(([h, t], i) => chain(i + 1, h, t))
}

test('3401 random permutations with open lines match the visited-set oracle', () => {
  let seed = 3401
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const n = 1 + rnd(10)
    const targets = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [targets[i], targets[j]] = [targets[j], targets[i]] }
    // A random permutation splits into several loops; dropping some arrows leaves open lines.
    const rows = []
    targets.forEach((target, i) => {
      const keep = rnd(5) !== 0
      if (i + 1 !== target && keep) rows.push([i + 1, target, 1 + rnd(4)])
    })
    assert.deepEqual(run(rows), oracle(rows), JSON.stringify(rows))
  }
})

test('3401 frames are well formed and the query is present', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const rows of [[[1, 2, 3], [2, 1, 4], [5, 6, 7]], []]) {
    const { frames } = buildTrace({ SecretSanta: table(rows) })
    for (const f of frames) {
      assert.ok(ids.has(f.phase), f.phase)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines.length)
      assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
      assert.ok(f.message.length > 0)
    }
    assert.equal(frames.at(-1).phase, 'done')
  }
  assert.match(sql, /WITH RECURSIVE/)
})

test('3401 a loop of L people is closed L times before distinct', () => {
  const { frames } = buildTrace({ SecretSanta: table([[1, 2, 1], [2, 3, 1], [3, 1, 1]]) })
  assert.equal(frames.at(-1).closedRows.length, 3)
  assert.equal(frames.at(-1).distinct.length, 1)
})
