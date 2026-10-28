import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2768 official examples', () => {
  assert.deepEqual(solve({ m: 3, n: 3, coordinates: [[0, 0]] }), [3, 1, 0, 0, 0])
  assert.deepEqual(solve({ m: 3, n: 3, coordinates: [[0, 0], [1, 1], [0, 2]] }), [0, 2, 2, 0, 0])
})

test('2768 edge case: a full 2 by 2 grid of black cells', () => {
  assert.deepEqual(solve({ m: 2, n: 2, coordinates: [[0, 0], [0, 1], [1, 0], [1, 1]] }), [0, 0, 0, 0, 1])
})

test('2768 rejects duplicate and out-of-grid cells', () => {
  assert.throws(() => parseInput('{"m":2,"n":2,"coordinates":[[0,0],[0,0]]}'))
  assert.throws(() => parseInput('{"m":2,"n":2,"coordinates":[[2,0]]}'))
})

// Independent oracle: test every 2 by 2 block directly against a set of black cells.
function oracle({ m, n, coordinates }) {
  const black = new Set(coordinates.map(([r, c]) => `${r},${c}`))
  const answer = [0, 0, 0, 0, 0]
  for (let top = 0; top < m - 1; top++) {
    for (let left = 0; left < n - 1; left++) {
      let count = 0
      for (const [dr, dc] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
        if (black.has(`${top + dr},${left + dc}`)) count += 1
      }
      answer[count] += 1
    }
  }
  return answer
}

test('2768 random grids match a block-by-block oracle', () => {
  let seed = 2768
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 2 + rnd(5)
    const n = 2 + rnd(5)
    const all = []
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) all.push([r, c])
    const coordinates = []
    const take = 1 + rnd(Math.min(12, all.length))
    while (coordinates.length < take) {
      const cell = all[rnd(all.length)]
      if (!coordinates.some(([r, c]) => r === cell[0] && c === cell[1])) coordinates.push(cell)
    }
    const input = { m, n, coordinates }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
