import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify(grid))).result

// Oracle: try every key collection order; between keys do a plain BFS where doors open for held keys.
function oracle(grid) {
  const m = grid.length, n = grid[0].length
  let start; const keyPos = {}
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) { const ch = grid[r][c]; if (ch === '@') start = [r, c]; if (ch >= 'a' && ch <= 'f') keyPos[ch] = [r, c] }
  const bfs = (from, to, held) => {
    const dist = new Map([[from.join(), 0]]); let q = [from]
    while (q.length) {
      const nq = []
      for (const [r, c] of q) {
        if (r === to[0] && c === to[1]) return dist.get([r, c].join())
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr, nc = c + dc
          if (nr < 0 || nc < 0 || nr >= m || nc >= n) continue
          const ch = grid[nr][nc]
          if (ch === '#' || (ch >= 'A' && ch <= 'F' && !held.has(ch.toLowerCase()))) continue
          const key = [nr, nc].join()
          if (!dist.has(key)) { dist.set(key, dist.get([r, c].join()) + 1); nq.push([nr, nc]) }
        }
      }
      q = nq
    }
    return Infinity
  }
  const letters = Object.keys(keyPos); let best = Infinity
  const perm = (cur, pos, held, total, left) => {
    if (total >= best) return
    if (!left.length) { best = total; return }
    for (const l of left) {
      const d = bfs(pos, keyPos[l], held)
      if (d === Infinity) continue
      perm(l, keyPos[l], new Set([...held, l]), total + d, left.filter(x => x !== l))
    }
  }
  perm(null, start, new Set(), 0, letters)
  return best === Infinity ? -1 : best
}

function randomGrid() {
  const m = 1 + Math.floor(Math.random() * 4), n = 2 + Math.floor(Math.random() * 4)
  const g = Array.from({ length: m }, () => Array.from({ length: n }, () => (Math.random() < 0.25 ? '#' : '.')))
  const cells = [...Array(m * n).keys()].sort(() => Math.random() - 0.5)
  const place = (ch) => { const i = cells.pop(); g[Math.floor(i / n)][i % n] = ch }
  if (m * n < 4) return null
  place('@')
  const k = 1 + Math.floor(Math.random() * Math.min(3, m * n - 2))
  for (let i = 0; i < k; i++) place(String.fromCharCode(97 + i))
  for (let i = 0; i < k; i++) if (cells.length && Math.random() < 0.6) place(String.fromCharCode(65 + i))
  return g.map(r => r.join(''))
}

test('official examples', () => {
  assert.equal(solve(['@.a..', '###.#', 'b.A.B']), 8)
  assert.equal(solve(['@..aA', '..B#.', '....b']), 6)
  assert.equal(solve(['@Aa']), -1)
})

test('matches key-order permutation BFS', () => {
  let tested = 0
  for (let t = 0; t < 1500 && tested < 400; t++) {
    const g = randomGrid(); if (!g) continue
    tested++; assert.equal(solve(g), oracle(g), JSON.stringify(g))
  }
})

test('trace shape', () => {
  const r = buildTrace(parseInput('["@a"]'))
  assert.equal(r.frames[0].phase, 'start'); assert.equal(r.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('["@.","a"]'))
  assert.throws(() => parseInput('["..a"]'))
  assert.throws(() => parseInput('["@.b"]'))
  assert.throws(() => parseInput('["@A"]'))
  assert.throws(() => parseInput('["@a","x."]'))
  assert.throws(() => parseInput('"@a"'))
})
