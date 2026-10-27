import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2684 official examples', () => {
  assert.equal(solve([[2, 4, 3, 5], [5, 4, 9, 3], [3, 4, 2, 11], [10, 9, 13, 15]]), 3)
  assert.equal(solve([[3, 2, 4], [2, 1, 9], [1, 1, 7]]), 0)
})

test('2684 a move needs a strictly larger value', () => {
  assert.equal(solve([[1, 1], [1, 2]]), 1)
})

test('2684 rejects a value outside 1 to 9', () => {
  assert.throws(() => parseInput(JSON.stringify({ grid: [[0]] })))
})

// Independent oracle: from each cell in the first column, find the longest run of moves forward
// by recursion, memoising each cell's answer.
function oracle(grid) {
  const m = grid.length
  const n = grid[0].length
  const memo = new Map()
  const longest = (r, c) => {
    const key = `${r},${c}`
    if (memo.has(key)) return memo.get(key)
    let best = 0
    for (const nr of [r - 1, r, r + 1]) {
      if (nr < 0 || nr >= m || c + 1 >= n) continue
      if (grid[nr][c + 1] > grid[r][c]) best = Math.max(best, 1 + longest(nr, c + 1))
    }
    memo.set(key, best)
    return best
  }
  let answer = 0
  for (let r = 0; r < m; r++) answer = Math.max(answer, longest(r, 0))
  return answer
}

test('2684 random grids match a forward recursion oracle', () => {
  let seed = 2684
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5)
    const n = 1 + rnd(5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(9)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
