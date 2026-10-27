import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2267 small examples', () => {
  // Right, right, down reads "(())", which is valid.
  assert.equal(solve(['(()', ')()']), true)
  // A 2 by 2 grid has three cells on every path, an odd count that cannot balance.
  assert.equal(solve(['((', '))']), false)
})

test('2267 a path must start with ( and end with )', () => {
  assert.equal(solve([')(', '()']), false)
})

test('2267 rejects a character other than parentheses', () => {
  assert.throws(() => parseInput(JSON.stringify({ grid: ['(a'] })))
})

// Independent oracle: build every right-or-down path as a string and test it directly.
function oracle(grid) {
  const m = grid.length
  const n = grid[0].length
  let found = false
  const walk = (r, c, text) => {
    if (found) return
    const next = text + grid[r][c]
    if (r === m - 1 && c === n - 1) {
      let depth = 0
      let valid = true
      for (const ch of next) {
        depth += ch === '(' ? 1 : -1
        if (depth < 0) valid = false
      }
      if (valid && depth === 0) found = true
      return
    }
    if (r + 1 < m) walk(r + 1, c, next)
    if (c + 1 < n) walk(r, c + 1, next)
  }
  walk(0, 0, '')
  return found
}

test('2267 random grids match an enumeration of every path string', () => {
  let seed = 2267
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => (rnd(2) ? '(' : ')')).join(''))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
