import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2718 official example', () => {
  assert.equal(solve({ n: 3, m: 3, queries: [[0, 0, 1], [1, 2, 2], [0, 2, 3], [1, 0, 4]] }), 23)
})

test('2718 edge case: a column overwrites part of an earlier row', () => {
  assert.equal(solve({ n: 2, m: 2, queries: [[0, 0, 5], [1, 1, 1]] }), 7)
})

test('2718 rejects an out-of-range index and a bad type', () => {
  assert.throws(() => parseInput('{"n":2,"m":2,"queries":[[0,2,1]]}'))
  assert.throws(() => parseInput('{"n":2,"m":2,"queries":[[2,0,1]]}'))
})

// Independent oracle: apply every query to a real matrix in order, then add the cells.
function oracle({ n, m, queries }) {
  const grid = Array.from({ length: n }, () => Array(m).fill(0))
  for (const [kind, index, value] of queries) {
    if (kind === 0) grid[index].fill(value)
    else for (let r = 0; r < n; r++) grid[r][index] = value
  }
  return grid.flat().reduce((a, b) => a + b, 0)
}

test('2718 random queries match a forward-simulation oracle', () => {
  let seed = 2718
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const m = 1 + rnd(5)
    const queries = Array.from({ length: 1 + rnd(8) }, () => {
      const kind = rnd(2)
      return [kind, rnd(kind === 0 ? n : m), rnd(21)]
    })
    const input = { n, m, queries }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
