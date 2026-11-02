import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result
const grid = text => JSON.parse(text)

test('2123 worked examples', () => {
  assert.equal(solve('[[1,1,1],[1,1,1],[1,1,1]]'), 4)
  assert.equal(solve('[[1,0],[0,1]]'), 0)
  assert.equal(solve('[[1,1],[1,1]]'), 2)
  assert.equal(solve('[[0,0,0]]'), 0)
})

test('2123 rejects malformed grids', () => {
  assert.throws(() => parseInput('[[1,2]]'))
  assert.throws(() => parseInput('[[1,1],[1]]'))
  assert.throws(() => parseInput('[[1,1,1,1,1,1,1]]'))
})

// Oracle: try every removal subset of ones, keep the smallest that leaves no adjacent pair.
function oracle(g) {
  const cells = []
  g.forEach((row, r) => row.forEach((v, c) => { if (v === 1) cells.push([r, c]) }))
  let best = Infinity
  for (let mask = 0; mask < 1 << cells.length; mask++) {
    const kept = new Set()
    cells.forEach((cell, i) => { if (!(mask & (1 << i))) kept.add(cell.join(',')) })
    let ok = true
    for (const [r, c] of cells) {
      if (!kept.has(`${r},${c}`)) continue
      if (kept.has(`${r + 1},${c}`) || kept.has(`${r},${c + 1}`)) { ok = false; break }
    }
    if (ok) best = Math.min(best, cells.length - kept.size)
  }
  return best
}

test('2123 random small grids match a removal-subset oracle', () => {
  let seed = 2123
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(4)
    const cols = 1 + rnd(4)
    const g = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(2)))
    const ones = g.flat().filter(v => v === 1).length
    if (ones > 12) continue
    assert.equal(solve(JSON.stringify(g)), oracle(g), JSON.stringify(g))
  }
})

test('2123 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const text of ['[[1,1,1],[1,1,1],[1,1,1]]', '[[1,1],[1,1]]']) {
    for (const frame of buildTrace({ grid: grid(text) }).frames) {
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
    }
  }
})
