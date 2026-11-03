import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, ranges) => buildTrace({ n, ranges }).result

test('2655 authored presets', () => {
  assert.deepEqual(solve(12, [[3, 5], [1, 2], [8, 8]]), [[0, 0], [6, 7], [9, 11]])
  assert.deepEqual(solve(6, [[0, 5]]), [])
  assert.deepEqual(solve(8, [[4, 4], [1, 6], [7, 7]]), [[0, 0]])
  assert.deepEqual(solve(5, []), [[0, 4]])
})

test('2655 adjacent and nested coverage merge without a gap', () => {
  assert.deepEqual(solve(6, [[0, 1], [2, 3], [4, 4]]), [[5, 5]])
  assert.deepEqual(solve(5, [[0, 1], [2, 3], [4, 4]]), [])
  assert.deepEqual(solve(10, [[0, 9], [2, 3]]), [])
  assert.deepEqual(solve(5, [[0, 0], [2, 2], [4, 4]]), [[1, 1], [3, 3]])
})

test('2655 input validation', () => {
  assert.throws(() => parseInput('{"n":4,"ranges":[[2,4]]}'))
  assert.throws(() => parseInput('{"n":4,"ranges":[[3,1]]}'))
  assert.throws(() => parseInput('{"n":0,"ranges":[]}'))
})

function oracle(n, ranges) {
  const cov = Array(n).fill(false)
  for (const [l, r] of ranges) for (let c = l; c <= r; c++) cov[c] = true
  const out = []
  for (let c = 0; c < n;) {
    if (cov[c]) { c++; continue }
    const start = c
    while (c < n && !cov[c]) c++
    out.push([start, c - 1])
  }
  return out
}

test('2655 random inputs match a cell-by-cell oracle', () => {
  let seed = 2655
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(15)
    const ranges = Array.from({ length: rnd(6) }, () => { const l = rnd(n); return [l, l + rnd(n - l)] })
    assert.deepEqual(solve(n, ranges), oracle(n, ranges), JSON.stringify({ n, ranges }))
  }
})

test('2655 frames keep valid lines and gaps are sorted and disjoint', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ n: 12, ranges: [[3, 5], [1, 2], [8, 8]] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
  for (let i = 1; i < run.result.length; i++) assert.ok(run.result[i - 1][1] < run.result[i][0])
  assert.equal(run.frames.at(-1).phase, 'done')
})
