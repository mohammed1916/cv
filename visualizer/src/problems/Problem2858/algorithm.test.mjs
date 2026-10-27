import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: for each start, walk the whole tree and count the edges that point toward the start.
function oracle({ n, edges }) {
  return Array.from({ length: n }, (_, start) => {
    let reversals = 0
    const seen = new Set([start])
    const queue = [start]
    for (let q = 0; q < queue.length; q++) {
      const p = queue[q]
      for (const [from, to] of edges) {
        if (from === p && !seen.has(to)) { seen.add(to); queue.push(to) }
        else if (to === p && !seen.has(from)) { seen.add(from); queue.push(from); reversals++ }
      }
    }
    return reversals
  })
}

test('2858 small trees', () => {
  assert.deepEqual(solve({ n: 2, edges: [[0, 1]] }), [0, 1])
  assert.deepEqual(solve({ n: 3, edges: [[1, 0], [1, 2]] }), [1, 0, 1])
})

test('2858 a chain pointing away from node 0 needs no reversal from 0', () => {
  assert.deepEqual(solve({ n: 4, edges: [[0, 1], [1, 2], [2, 3]] }), [0, 1, 2, 3])
})

test('2858 rejects a cycle and an out of range node', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[1,0]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,3],[1,2]]}'))
})

test('2858 random trees match a per-start oracle', () => {
  let seed = 2858
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const edges = []
    for (let i = 1; i < n; i++) {
      const parent = rnd(i)
      edges.push(rnd(2) ? [parent, i] : [i, parent])
    }
    const input = { n, edges }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
