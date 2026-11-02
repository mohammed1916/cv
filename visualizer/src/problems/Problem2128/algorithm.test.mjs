import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2128 worked examples', () => {
  assert.equal(solve('[[1,0],[0,1]]'), true)
  assert.equal(solve('[[1,0,1],[1,1,0]]'), false)
  assert.equal(solve('[[0]]'), true)
  assert.equal(solve('[[1,1],[1,1]]'), true)
})

test('2128 rejects malformed grids', () => {
  assert.throws(() => parseInput('[[1,2]]'))
  assert.throws(() => parseInput('[[1],[1,0]]'))
})

// Oracle: try every combination of row flips and column flips and check for an all-zero grid.
function oracle(g) {
  const R = g.length
  const C = g[0].length
  for (let rowMask = 0; rowMask < 1 << R; rowMask++) {
    for (let colMask = 0; colMask < 1 << C; colMask++) {
      let clear = true
      for (let r = 0; r < R && clear; r++) {
        for (let c = 0; c < C; c++) {
          const bit = g[r][c] ^ ((rowMask >> r) & 1) ^ ((colMask >> c) & 1)
          if (bit) { clear = false; break }
        }
      }
      if (clear) return true
    }
  }
  return false
}

test('2128 random grids match a flip-subset oracle', () => {
  let seed = 2128
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const R = 1 + rnd(4)
    const C = 1 + rnd(4)
    const g = Array.from({ length: R }, () => Array.from({ length: C }, () => rnd(2)))
    assert.equal(solve(JSON.stringify(g)), oracle(g), JSON.stringify(g))
  }
})

test('2128 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const text of ['[[1,0],[0,1]]', '[[1,0,1],[1,1,0]]']) {
    for (const frame of buildTrace(parseInput(text)).frames) {
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
    }
  }
})
