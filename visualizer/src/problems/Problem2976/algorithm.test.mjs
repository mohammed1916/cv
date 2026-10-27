import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2976 official examples', () => {
  assert.equal(solve({ source: 'abcd', target: 'acbe', original: ['a', 'b', 'c', 'c', 'e', 'd'], changed: ['b', 'c', 'b', 'e', 'b', 'e'], cost: [2, 5, 5, 1, 2, 20] }), 28)
  assert.equal(solve({ source: 'aaaa', target: 'bbbb', original: ['a', 'c'], changed: ['c', 'b'], cost: [1, 2] }), 12)
  assert.equal(solve({ source: 'abcd', target: 'abce', original: ['a'], changed: ['e'], cost: [1] }), -1)
})

test('2976 rejects unequal source and target', () => {
  assert.throws(() => parseInput('{"source":"ab","target":"a","original":[],"changed":[],"cost":[]}'))
})

// Independent oracle: Bellman-Ford from each source letter over the rule edges, then sum.
function oracle({ source, target, original, changed, cost }) {
  const edges = original.map((o, i) => [o, changed[i], cost[i]])
  const from = start => {
    const d = { [start]: 0 }
    for (let round = 0; round < 26; round++) {
      for (const [u, v, w] of edges) {
        if (d[u] !== undefined && (d[v] === undefined || d[u] + w < d[v])) d[v] = d[u] + w
      }
    }
    return d
  }
  let total = 0
  for (let i = 0; i < source.length; i++) {
    const d = from(source[i])
    const c = d[target[i]]
    if (c === undefined) return -1
    total += c
  }
  return total
}

test('2976 random inputs match a Bellman-Ford oracle', () => {
  let seed = 2976
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const L = () => String.fromCharCode(97 + rnd(5))
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    const source = Array.from({ length: len }, L).join('')
    const target = Array.from({ length: len }, L).join('')
    const m = rnd(8)
    const original = Array.from({ length: m }, L)
    const changed = Array.from({ length: m }, L)
    const cost = Array.from({ length: m }, () => 1 + rnd(20))
    const input = { source, target, original, changed, cost }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
