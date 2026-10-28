import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2713 official examples', () => {
  assert.equal(solve([[3, 1], [3, 4]]), 2)
  assert.equal(solve([[1, 1], [1, 1]]), 1)
  assert.equal(solve([[3, 1, 6], [-9, 5, 7]]), 4)
})

test('2713 rejects ragged rows and out-of-range values', () => {
  assert.throws(() => parseInput('[[1,2],[3]]'))
  assert.throws(() => parseInput('[[21]]'))
})

// Independent oracle: build the move graph (same row or column, strictly larger value) and find the longest path by memoised search.
function oracle(mat) {
  const m = mat.length
  const n = mat[0].length
  const memo = new Map()
  const longest = (r, c) => {
    const key = r * n + c
    if (memo.has(key)) return memo.get(key)
    let best = 1
    for (let k = 0; k < n; k++) if (mat[r][k] > mat[r][c]) best = Math.max(best, 1 + longest(r, k))
    for (let k = 0; k < m; k++) if (mat[k][c] > mat[r][c]) best = Math.max(best, 1 + longest(k, c))
    memo.set(key, best)
    return best
  }
  let answer = 0
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) answer = Math.max(answer, longest(r, c))
  return answer
}

test('2713 random matrices match a memoised move-graph oracle', () => {
  let seed = 2713
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    const mat = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(7) - 3))
    assert.equal(solve(mat), oracle(mat), JSON.stringify(mat))
  }
})
