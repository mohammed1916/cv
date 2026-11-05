import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (scores, edges) => buildTrace({ scores, edges }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (scores, edges) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(max_score_four_nodes(${JSON.stringify(scores)}, ${JSON.stringify(edges)}))`]).toString().trim())

function brute(scores, edges) {
  const n = scores.length
  const has = (a, b) => edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
  let best = -1
  const used = Array(n).fill(false)
  const rec = (seq) => {
    if (seq.length === 4) {
      if (has(seq[0], seq[1]) && has(seq[1], seq[2]) && has(seq[2], seq[3])) best = Math.max(best, seq.reduce((s, v) => s + scores[v], 0))
      return
    }
    for (let v = 0; v < n; v++) {
      if (used[v]) continue
      if (seq.length && !has(seq[seq.length - 1], v)) continue
      used[v] = true; seq.push(v); rec(seq); seq.pop(); used[v] = false
    }
  }
  rec([])
  return best
}

test('2242 a star with one extra edge', () => {
  const scores = [5, 1, 3, 2, 4]
  const edges = [[0, 1], [0, 2], [0, 3], [3, 4]]
  assert.equal(solve(scores, edges), brute(scores, edges))
  assert.equal(solve([1, 2, 3, 4], [[0, 1], [1, 2]]), -1)
})

test('2242 a path of four nodes scores its sum', () => {
  assert.equal(solve([2, 3, 4, 5], [[0, 1], [1, 2], [2, 3]]), 14)
})

test('2242 matches an exhaustive search over node sequences', () => {
  let seed = 2242
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 120; t++) {
    const n = 4 + rnd(3)
    const scores = Array.from({ length: n }, () => 1 + rnd(20))
    const pairs = []
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (rnd(2)) pairs.push([a, b])
    assert.equal(solve(scores, pairs), brute(scores, pairs), JSON.stringify({ scores, pairs }))
    if (t < 8) assert.equal(runPy(scores, pairs), brute(scores, pairs))
  }
})

test('2242 frames point at real python lines', () => {
  for (const f of buildTrace({ scores: [1, 2, 3, 4], edges: [[0, 1], [1, 2], [2, 3]] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2242 rejects bad input', () => {
  assert.throws(() => parseInput('{"scores":[1,2,3],"edges":[]}'))
  assert.throws(() => parseInput('{"scores":[1,2,3,4],"edges":[[0,0]]}'))
})
