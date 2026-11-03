import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (width, height, sideLength, maxOnes) => buildTrace({ width, height, sideLength, maxOnes }).result

const PHASES = new Set(['start', 'free', 'count', 'sort', 'pick', 'done'])

test('1183 hand-checked small boards', () => {
  assert.equal(solve(3, 3, 2, 1), 4) // residues: (0,0) covers 4 cells, keep it
  assert.equal(solve(3, 3, 3, 4), 4) // one window covers all cells, keep 4 cells that each hold one
  assert.equal(solve(4, 4, 2, 2), 8) // four residue classes of size 4; keep two
  assert.equal(solve(5, 1, 2, 1), 5) // window taller than board: unconstrained
  assert.equal(solve(2, 2, 1, 0), 0) // no ones allowed in any 1 by 1 window
})

test('1183 window larger than the board is unconstrained', () => {
  assert.equal(solve(3, 8, 5, 1), 24)
  assert.equal(solve(1, 6, 2, 0), 6)
})

test('1183 parse rejects out-of-range fields', () => {
  assert.throws(() => parseInput('{"width":0,"height":3,"sideLength":2,"maxOnes":1}'))
  assert.throws(() => parseInput('{"width":3,"height":3,"sideLength":7,"maxOnes":1}'))
  assert.throws(() => parseInput('{"width":3,"height":3,"sideLength":2,"maxOnes":5}'))
  assert.throws(() => parseInput('[1,2,3]'))
  assert.deepEqual(parseInput('{"width":3,"height":4,"sideLength":2,"maxOnes":3}'), { width: 3, height: 4, sideLength: 2, maxOnes: 3 })
})

test('1183 pseudocode and python lines exist', () => {
  assert.ok(code.length > 5)
  assert.ok(python.includes('def max_ones'))
})

// Brute force: try every 0/1 assignment and keep the best one where every full window is within the limit.
function oracle(width, height, S, K) {
  const cells = width * height
  let best = -1
  for (let mask = 0; mask < (1 << cells); mask++) {
    const at = (i, j) => (mask >> (i * width + j)) & 1
    let ok = true
    for (let i = 0; i + S <= height && ok; i++) {
      for (let j = 0; j + S <= width && ok; j++) {
        let sum = 0
        for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) sum += at(i + a, j + b)
        if (sum > K) ok = false
      }
    }
    if (!ok) continue
    let total = 0
    for (let c = 0; c < cells; c++) total += (mask >> c) & 1
    best = Math.max(best, total)
  }
  return best
}

test('1183 random small boards match a brute-force oracle', () => {
  let seed = 1183
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const width = 1 + rnd(4)
    const height = 1 + rnd(4)
    const S = 1 + rnd(3)
    const K = rnd(S * S + 1)
    assert.equal(solve(width, height, S, K), oracle(width, height, S, K), JSON.stringify({ width, height, S, K }))
  }
})

test('1183 frame invariants hold on every run', () => {
  for (const [w, h, S, K] of [[7, 5, 3, 4], [6, 6, 4, 5], [3, 8, 5, 1], [12, 12, 6, 0], [1, 1, 1, 1], [5, 4, 2, 9]]) {
    const { frames, result, input } = buildTrace({ width: w, height: h, sideLength: S, maxOnes: K })
    assert.ok(frames.length > 0)
    for (const f of frames) {
      assert.ok(PHASES.has(f.phase), f.phase)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
      assert.ok(f.pythonLine >= 1, 'pythonLine in range')
      assert.equal(f.board.length, h)
      assert.ok(f.board.every(row => row.length === w))
      assert.ok(f.picked.length <= K)
      assert.equal(f.counts.length, S)
    }
    assert.equal(frames.at(-1).phase, 'done')
    assert.equal(frames.at(-1).total, result)
    assert.deepEqual(input, { width: w, height: h, sideLength: S, maxOnes: K })
  }
})

test('1183 count frames sum to the board area', () => {
  const { frames } = buildTrace({ width: 7, height: 5, sideLength: 3, maxOnes: 4 })
  const last = frames.filter(f => f.phase === 'count').at(-1)
  const total = last.counts.flat().reduce((a, v) => a + v, 0)
  assert.equal(total, 35)
})
