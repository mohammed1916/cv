import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2977 pieces convert through a shared rule', () => {
  assert.equal(solve({ source: 'ab', target: 'ca', original: ['ab'], changed: ['ca'], cost: [1] }), 1)
  // "ab" to "ca" costs 3 per piece, and the source has two such pieces.
  assert.equal(solve({ source: 'abab', target: 'caca', original: ['ab'], changed: ['ca'], cost: [3] }), 6)
})

test('2977 chained rules and unchanged letters', () => {
  // a -> b (2), then b -> c (5) makes "a" cost 7 to become "c"; the middle "b" stays.
  assert.equal(solve({ source: 'aba', target: 'cbc', original: ['a', 'b'], changed: ['b', 'c'], cost: [2, 5] }), 14)
  assert.equal(solve({ source: 'aa', target: 'aa', original: [], changed: [], cost: [] }), 0)
})

test('2977 reports -1 when a piece cannot be converted', () => {
  assert.equal(solve({ source: 'a', target: 'b', original: ['c'], changed: ['b'], cost: [1] }), -1)
})

test('2977 rejects rules whose strings differ in length', () => {
  assert.throws(() => parseInput('{"source":"a","target":"b","original":["ab"],"changed":["c"],"cost":[1]}'))
})

// Independent oracle: top-down recursion over start positions, with Bellman-Ford for each piece cost.
function oracle({ source, target, original, changed, cost }) {
  const edges = original.map((o, i) => [o, changed[i], cost[i]])
  const pieceCost = (a, b) => {
    if (a === b) return 0
    const d = { [a]: 0 }
    for (let round = 0; round <= edges.length; round++) {
      for (const [u, v, w] of edges) {
        if (d[u] !== undefined && (d[v] === undefined || d[u] + w < d[v])) d[v] = d[u] + w
      }
    }
    return d[b] === undefined ? Infinity : d[b]
  }
  const N = source.length
  const memo = new Map()
  const from = i => {
    if (i === N) return 0
    if (memo.has(i)) return memo.get(i)
    let best = Infinity
    for (let j = i + 1; j <= N; j++) {
      const c = pieceCost(source.slice(i, j), target.slice(i, j))
      if (c !== Infinity) best = Math.min(best, c + from(j))
    }
    memo.set(i, best)
    return best
  }
  const r = from(0)
  return r === Infinity ? -1 : r
}

test('2977 random inputs match a Bellman-Ford recursion oracle', () => {
  let seed = 2977
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const piece = len => Array.from({ length: len }, () => String.fromCharCode(97 + rnd(3))).join('')
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(6)
    const source = piece(len)
    const target = piece(len)
    const m = rnd(6)
    const original = []
    const changed = []
    for (let i = 0; i < m; i++) {
      const size = 1 + rnd(3)
      original.push(piece(size))
      changed.push(piece(size))
    }
    const costs = Array.from({ length: m }, () => 1 + rnd(20))
    const input = { source, target, original, changed, cost: costs }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
