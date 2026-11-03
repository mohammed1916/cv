import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges) => buildTrace({ n, edges }).result

test('1557 sample graphs return their sources', () => {
  assert.deepEqual(solve(6, [[0, 2], [1, 2], [2, 3], [4, 5]]), [0, 1, 4])
  assert.deepEqual(solve(4, [[3, 2], [2, 1], [1, 0]]), [3])
  assert.deepEqual(solve(3, []), [0, 1, 2])
})

test('1557 rejects malformed, self-loop and cyclic graphs', () => {
  assert.throws(() => parseInput('[]'), /object/)
  assert.throws(() => parseInput('{"n":3,"edges":[[0,3]]}'), /0 to n-1/)
  assert.throws(() => parseInput('{"n":3,"edges":[[1,1]]}'), /different/)
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[1,2],[2,0]]}'), /cycles/)
})

// Oracle: the answer is exactly the zero in-degree vertices, and every vertex is reachable from them.
test('1557 random DAGs return sources that reach every vertex', () => {
  let seed = 11
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(9)
    const order = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [order[i], order[j]] = [order[j], order[i]] }
    const edges = []
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (rnd(3) === 0) edges.push([order[a], order[b]])
    const input = JSON.stringify({ n, edges })
    parseInput(input)
    const got = solve(n, edges)
    const hasIn = new Set(edges.map(([, b]) => b))
    const expected = Array.from({ length: n }, (_, v) => v).filter(v => !hasIn.has(v))
    assert.deepEqual(got, expected, input)
    const reach = new Set(got)
    let grew = true
    while (grew) {
      grew = false
      for (const [a, b] of edges) if (reach.has(a) && !reach.has(b)) { reach.add(b); grew = true }
    }
    assert.equal(reach.size, n, input)
  }
})
