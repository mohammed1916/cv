import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const MOD = 1000000007n
const solve = (grid, d) => buildTrace({ grid, d }).result

test('3797 official examples', () => {
  assert.equal(solve(['..', '#.'], 1), 2)
  assert.equal(solve(['..', '#.'], 2), 4)
  assert.equal(solve(['#'], 750), 0)
  assert.equal(solve(['..'], 1), 4)
})

test('3797 parses the example inputs', () => {
  assert.deepEqual(parseInput('{"grid":["..","#."],"d":1}'), { grid: ['..', '#.'], d: 1 })
  assert.throws(() => parseInput('{"grid":[],"d":1}'))
  assert.throws(() => parseInput('{"grid":["..","#"],"d":1}'))
  assert.throws(() => parseInput('{"grid":[".x"],"d":1}'))
  assert.throws(() => parseInput('{"grid":["."],"d":0}'))
  assert.throws(() => parseInput('{"grid":["."],"d":751}'))
})

test('3797 frames point at executable python lines', () => {
  const lineCount = python.split('\n').length
  const { frames } = buildTrace({ grid: ['..', '#.'], d: 2 })
  assert.ok(frames.length > 0)
  for (const f of frames) {
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lineCount, JSON.stringify(f))
    assert.ok(f.activeLine >= 1)
    assert.equal(typeof f.message, 'string')
  }
})

// Oracle: depth-first enumeration of every legal route on small grids.
function oracle(grid, d) {
  const R = grid.length
  const C = grid[0].length
  const open = (r, c) => grid[r][c] === '.'
  const near = (r1, c1, r2, c2) => (r1 - r2) ** 2 + (c1 - c2) ** 2 <= d * d
  let count = 0
  const walk = (r, c, lastSideways) => {
    if (r === 0) count++
    if (!lastSideways) {
      for (let c2 = 0; c2 < C; c2++) if (c2 !== c && open(r, c2) && near(r, c, r, c2)) walk(r, c2, true)
    }
    if (r > 0) {
      for (let c2 = 0; c2 < C; c2++) if (open(r - 1, c2) && near(r, c, r - 1, c2)) walk(r - 1, c2, false)
    }
  }
  for (let c = 0; c < C; c++) if (open(R - 1, c)) walk(R - 1, c, false)
  return count % 1000000007
}

test('3797 matches a brute-force oracle on small grids', () => {
  let seed = 3797
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 400; t++) {
    const R = 1 + rnd(4)
    const C = 1 + rnd(4)
    const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (rnd(4) === 0 ? '#' : '.')).join(''))
    const d = 1 + rnd(4)
    assert.equal(solve(grid, d), oracle(grid, d), JSON.stringify({ grid, d }))
  }
})

test('3797 full open grid stays within the modulus', () => {
  const grid = Array.from({ length: 8 }, () => '........')
  const result = solve(grid, 750)
  assert.equal(typeof result, 'number')
  assert.ok(BigInt(result) < MOD)
})
