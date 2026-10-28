import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2493 official-style examples', () => {
  assert.equal(solve({ n: 6, edges: [[1, 2], [1, 4], [1, 5], [2, 6], [2, 3], [4, 6]] }), 4)
  // A triangle is an odd cycle, so no grouping is possible.
  assert.equal(solve({ n: 3, edges: [[1, 2], [2, 3], [3, 1]] }), -1)
})

test('2493 isolated nodes each form one group', () => {
  assert.equal(solve({ n: 3, edges: [] }), 3)
  assert.equal(solve({ n: 1, edges: [] }), 1)
})

test('2493 rejects a repeated undirected edge', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2],[2,1]]}'), /once/)
})

// Independent oracle: try every labelling of nodes with group numbers 1..n, keep labellings whose used
// groups are exactly 1..m with each edge joining neighbouring groups, and return the largest m.
function oracle({ n, edges }) {
  let best = -1
  const label = Array(n + 1).fill(1)
  const combos = n ** n
  for (let code = 0; code < combos; code++) {
    let x = code
    for (let v = 1; v <= n; v++) { label[v] = (x % n) + 1; x = Math.floor(x / n) }
    if (!edges.every(([a, b]) => Math.abs(label[a] - label[b]) === 1)) continue
    const values = label.slice(1)
    const m = Math.max(...values)
    const used = new Set(values)
    let contiguous = true
    for (let g = 1; g <= m; g++) if (!used.has(g)) { contiguous = false; break }
    if (contiguous && m > best) best = m
  }
  return best
}

test('2493 random small graphs match a labelling oracle', () => {
  let seed = 2493
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let valid = 0
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const edges = []
    const used = new Set()
    for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) {
      if (rnd(3) === 0 && !used.has(`${a},${b}`)) { used.add(`${a},${b}`); edges.push([a, b]) }
    }
    const input = { n, edges }
    const expected = oracle(input)
    if (expected !== -1) valid++
    assert.equal(solve(input), expected, JSON.stringify(input))
  }
  assert.ok(valid > 0)
})
