import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (score, k) => buildTrace(parseInput(JSON.stringify({ score, k }))).result

test('2545 official examples', () => {
  assert.deepEqual(
    solve([[10, 6, 9, 1], [7, 5, 11, 2], [4, 8, 3, 15]], 2),
    [[7, 5, 11, 2], [10, 6, 9, 1], [4, 8, 3, 15]],
  )
  assert.deepEqual(solve([[3, 4], [5, 6]], 0), [[5, 6], [3, 4]])
})

test('2545 a single student is returned unchanged', () => {
  assert.deepEqual(solve([[7, 1, 4]], 1), [[7, 1, 4]])
})

test('2545 rejects a column index out of range', () => {
  assert.throws(() => parseInput('{"score":[[1,2]],"k":2}'))
})

// Independent oracle: sort a copy with a comparator on the chosen column.
function oracle(score, k) {
  return [...score].map(r => [...r]).sort((a, b) => b[k] - a[k])
}

test('2545 random tables match a comparator-sort oracle', () => {
  let seed = 2545
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(8)
    const n = 1 + rnd(5)
    const score = Array.from({ length: m }, () => Array(n).fill(0))
    for (let j = 0; j < n; j++) {
      const used = new Set()
      for (let i = 0; i < m; i++) {
        let v
        do { v = rnd(101) } while (used.has(v))
        used.add(v)
        score[i][j] = v
      }
    }
    const k = rnd(n)
    assert.deepEqual(solve(score, k), oracle(score, k), JSON.stringify({ score, k }))
  }
})
