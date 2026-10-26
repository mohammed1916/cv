import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = b => buildTrace(parseInput(JSON.stringify(b)))
const fromBits = (n, v) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (v >> (i * n + j)) & 1))
const key = b => b.map(r => r.join('')).join('/')
// Oracle: multi-source BFS from the two chessboards over row-swap and column-swap moves.
function distances(n) {
  const boards = [0, 1].map(s => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i + j + s) % 2)))
  const dist = new Map(boards.map(b => [key(b), 0]))
  let frontier = boards
  while (frontier.length) {
    const next = []
    for (const b of frontier) {
      const d = dist.get(key(b))
      for (let x = 0; x < n; x++) for (let y = x + 1; y < n; y++) {
        const r = b.map(row => [...row]); [r[x], r[y]] = [r[y], r[x]]
        const c = b.map(row => { const q = [...row]; [q[x], q[y]] = [q[y], q[x]]; return q })
        for (const t of [r, c]) if (!dist.has(key(t))) { dist.set(key(t), d + 1); next.push(t) }
      }
    }
    frontier = next
  }
  return dist
}
test('official examples', () => {
  assert.equal(run([[0, 1, 1, 0], [0, 1, 1, 0], [1, 0, 0, 1], [1, 0, 0, 1]]).result, 2)
  assert.equal(run([[0, 1], [1, 0]]).result, 0)
  assert.equal(run([[1, 0], [1, 0]]).result, -1)
})
test('every board for n=2,3,4 matches the BFS oracle', () => {
  for (const n of [2, 3, 4]) {
    const dist = distances(n)
    for (let v = 0; v < 1 << (n * n); v++) {
      const b = fromBits(n, v)
      const expected = dist.has(key(b)) ? dist.get(key(b)) : -1
      assert.equal(buildTrace(b).result, expected, key(b))
    }
  }
})
test('random 5x5 scrambles of a chessboard are solved', () => {
  let seed = 9
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 100; t++) {
    const n = 5
    let b = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i + j) % 2))
    for (let k = 0; k < 6; k++) { const x = rnd(n), y = rnd(n); [b[x], b[y]] = [b[y], b[x]]; b = b.map(r => { const q = [...r]; [q[x], q[y]] = [q[y], q[x]]; return q }) }
    const r = run(b)
    assert.ok(r.result >= 0 && r.result <= 2 * (n - 1))
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[[0,1,1],[1,0,1]]'))
  assert.throws(() => parseInput('[[2,0],[0,2]]'))
  assert.throws(() => parseInput('[[0]]'))
})
