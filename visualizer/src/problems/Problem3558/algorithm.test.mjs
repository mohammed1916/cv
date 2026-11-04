import test from 'node:test'
import assert from 'node:assert/strict'
import { MOD, buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = edges => buildTrace({ edges }).result
const chain = length => Array.from({ length }, (_, i) => [i + 1, i + 2])

function powMod(exponent) {
  let out = 1n
  for (let i = 0; i < exponent; i++) out = (out * 2n) % BigInt(MOD)
  return Number(out)
}

// Independent depth from a recursive walk, then a count over every weighting of that many edges.
function oracle(edges) {
  const links = new Map()
  for (const [u, v] of edges) {
    if (!links.has(u)) links.set(u, [])
    if (!links.has(v)) links.set(v, [])
    links.get(u).push(v)
    links.get(v).push(u)
  }
  const height = (node, from) => Math.max(0, ...links.get(node).filter(x => x !== from).map(x => height(x, node) + 1))
  const d = height(1, 0)
  let count = 0
  for (let bits = 0; bits < 2 ** d; bits++) {
    let cost = 0
    for (let i = 0; i < d; i++) cost += (bits >> i) & 1 ? 2 : 1
    if (cost % 2 === 1) count++
  }
  return count
}

test('3558 hand-computed cases', () => {
  assert.equal(solve([[2, 1]]), 1)
  assert.equal(solve([[1, 2], [1, 3], [1, 4]]), 1)
  assert.equal(solve([[4, 1], [2, 1], [3, 2], [5, 4]]), 2)
  assert.equal(solve([[1, 2], [1, 3], [2, 4], [2, 5], [5, 6], [3, 7]]), 4)
})

test('3558 the modulo applies on long chains', () => {
  assert.equal(solve(chain(32)), 147483634) // 2^31 - 2 * 1000000007
  assert.equal(solve(chain(39)), powMod(38))
})

test('3558 random trees match a full enumeration of weightings', () => {
  let seed = 3558
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(14)
    const labels = [1, ...Array.from({ length: n - 1 }, (_, i) => i + 2).sort(() => rnd(2) - 0.5)]
    const edges = []
    for (let i = 1; i < n; i++) edges.push(rnd(2) ? [labels[i], labels[rnd(i)]] : [labels[rnd(i)], labels[i]])
    assert.doesNotThrow(() => parseInput(JSON.stringify({ edges })))
    assert.equal(solve(edges), oracle(edges), JSON.stringify(edges))
  }
})

test('3558 parseInput rejects anything that is not a tree on 1 to n', () => {
  assert.throws(() => parseInput('{"edges":[]}'))
  assert.throws(() => parseInput('{"edges":[[1,1]]}'))
  assert.throws(() => parseInput('{"edges":[[1,5]]}'))
  assert.throws(() => parseInput('{"edges":[[1,2],[1,2]]}'))
  assert.throws(() => parseInput('{"edges":[[2,3],[3,2]]}'))
  assert.throws(() => parseInput(JSON.stringify({ edges: chain(40) })))
})

test('3558 frames show the path, the table and real lines', () => {
  const edges = [[1, 2], [1, 3], [2, 4], [2, 5], [5, 6], [3, 7]]
  const { frames, tree } = buildTrace({ edges })
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const f of frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
    assert.ok(f.message.length > 0)
  }
  assert.equal(tree.id, 1)
  const last = frames.at(-1)
  assert.deepEqual(last.path, [6, 5, 2, 1])
  assert.deepEqual(last.dp.values, [[1, 1, 2, 4], [0, 1, 2, 4]])
  assert.equal(last.listing.filter(item => item.odd).length, 4)
  assert.deepEqual(frames.find(f => f.phase === 'deepest').candidates, [6])
  assert.ok(pyLines[last.pythonLine - 1].includes('return odd'))
  assert.equal(frames.filter(f => f.phase === 'discover').length, 6)
  for (const f of frames.filter(f => f.phase === 'count' && f.listing)) {
    const k = f.edgeAt
    assert.equal(f.listing.length, 2 ** k)
    assert.equal(f.listing.filter(item => item.odd).length, f.dp.values[1][k] ?? f.dp.values[0][k])
  }
})

test('3558 ties list every deepest node', () => {
  const { frames } = buildTrace({ edges: [[4, 1], [2, 1], [3, 2], [5, 4]] })
  assert.deepEqual([...frames.find(f => f.phase === 'deepest').candidates].sort(), [3, 5])
})

test('3558 long paths stop listing weightings', () => {
  const last = buildTrace({ edges: chain(6) }).frames.at(-1)
  assert.equal(last.listing, null)
  assert.equal(last.odd, 32)
})
