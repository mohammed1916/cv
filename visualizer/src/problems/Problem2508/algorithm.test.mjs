import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (n, edges) => buildTrace({ n, edges }).result

test('2508 worked examples', () => {
  assert.equal(solve(4, [[1, 2], [2, 3]]), true)
  assert.equal(solve(4, [[1, 2], [1, 3], [1, 4]]), false)
  assert.equal(solve(5, [[1, 2], [2, 3], [3, 4], [4, 5], [5, 1]]), true)
})

test('2508 edge cases', () => {
  assert.equal(solve(3, []), true)
  assert.equal(solve(3, [[1, 2]]), true)
  assert.equal(solve(4, [[1, 2], [3, 4]]), true)
  assert.equal(solve(6, [[1, 2], [3, 4], [5, 6]]), false)
  assert.equal(solve(5, [[1, 2], [1, 3], [1, 4], [1, 5], [2, 3]]), true)
})

test('2508 rejects loops and repeated edges', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,1]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2],[2,1]]}'))
})

test('2508 python line numbers name the executed statements', () => {
  const lines = python.split('\n')
  const expect = { 2: 'adj = [set()', 6: 'odd = [v', 8: 'return True', 11: 'if b not in adj[a]:', 12: 'return True', 13: 'for c in range', 14: 'if c != a', 15: 'return True', 16: 'return False', 19: 'for x, y, z, w', 20: 'if y not in adj[x]', 21: 'return True', 22: 'return False', 23: 'return False' }
  for (const [line, text] of Object.entries(expect)) assert.ok(lines[Number(line) - 1].trim().startsWith(text), `line ${line}: ${lines[Number(line) - 1]}`)
  const { frames } = buildTrace({ n: 4, edges: [[1, 2], [1, 3], [1, 4]] })
  for (const frame of frames) assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length, JSON.stringify(frame))
})

// Independent oracle: try every set of at most two new edges that are not already present.
function oracle(n, edges) {
  const present = new Set(edges.map(([a, b]) => (a < b ? `${a},${b}` : `${b},${a}`)))
  const candidates = []
  for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) if (!present.has(`${a},${b}`)) candidates.push([a, b])
  const even = extra => {
    const deg = Array(n + 1).fill(0)
    for (const [a, b] of [...edges, ...extra]) { deg[a]++; deg[b]++ }
    return deg.slice(1).every(d => d % 2 === 0)
  }
  if (even([])) return true
  for (let i = 0; i < candidates.length; i++) {
    if (even([candidates[i]])) return true
    for (let j = i + 1; j < candidates.length; j++) if (even([candidates[i], candidates[j]])) return true
  }
  return false
}

test('2508 random graphs match a two-edge brute force', () => {
  let seed = 2508
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 400; t++) {
    const n = 3 + rnd(5)
    const all = []
    for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) all.push([a, b])
    const edges = all.filter(() => rnd(3) === 0)
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
