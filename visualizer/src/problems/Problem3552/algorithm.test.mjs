import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = matrix => buildTrace(parseInput(JSON.stringify({ matrix }))).result

test('3552 official examples', () => {
  assert.equal(solve(['A..', '.A.', '...']), 2)
  assert.equal(solve(['.#...', '.#.#.', '.#.#.', '...#.']), 13)
})

test('3552 a blocked grid returns -1', () => {
  assert.equal(solve(['.#', '#.']), -1)
})

test('3552 a teleport from the start can reach the goal with no moves', () => {
  assert.equal(solve(['A.', '.A']), 0)
  assert.equal(solve(['A#A', '...']), 1)
})

test('3552 rejects a row with a stray character', () => {
  assert.throws(() => parseInput('{"matrix":["a.."]}'))
})

// Independent oracle: label-correcting relaxation over (cell, letters used) states, found by repeated sweeps instead of a layered queue.
function oracle(matrix) {
  const R = matrix.length
  const C = matrix[0].length
  const dist = new Map()
  const start = '0,0,0'
  dist.set(start, 0)
  let changed = true
  const relax = (key, d) => {
    if (!dist.has(key) || d < dist.get(key)) { dist.set(key, d); changed = true }
  }
  while (changed) {
    changed = false
    for (const [key, d] of [...dist.entries()]) {
      const [r, c, mask] = key.split(',').map(Number)
      const ch = matrix[r][c]
      if (ch >= 'A' && ch <= 'Z' && !((mask >> (ch.charCodeAt(0) - 65)) & 1)) {
        for (let r2 = 0; r2 < R; r2++) for (let c2 = 0; c2 < C; c2++) {
          if (matrix[r2][c2] === ch && (r2 !== r || c2 !== c)) relax(`${r2},${c2},${mask | (1 << (ch.charCodeAt(0) - 65))}`, d)
        }
      }
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const r2 = r + dr
        const c2 = c + dc
        if (r2 >= 0 && r2 < R && c2 >= 0 && c2 < C && matrix[r2][c2] !== '#') relax(`${r2},${c2},${mask}`, d + 1)
      }
    }
  }
  let best = -1
  for (const [key, d] of dist) {
    const [r, c] = key.split(',').map(Number)
    if (r === R - 1 && c === C - 1 && (best === -1 || d < best)) best = d
  }
  return best
}

test('3552 random grids match a relaxation oracle', () => {
  let seed = 3552
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pool = '..##ABA'
  for (let trial = 0; trial < 150; trial++) {
    const R = 1 + rnd(4)
    const C = 1 + rnd(4)
    const matrix = Array.from({ length: R }, () => Array.from({ length: C }, () => pool[rnd(pool.length)]).join(''))
    if (matrix[0][0] === '#') matrix[0] = '.' + matrix[0].slice(1)
    assert.equal(solve(matrix), oracle(matrix), JSON.stringify(matrix))
  }
})
