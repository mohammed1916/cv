import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Direct tiling count for a 2 x n board: fill the first empty cell in column-major order with a domino or an L-tromino.
function countTilings(n) {
  const filled = Array.from({ length: 2 }, () => Array(n).fill(false))
  const order = []
  for (let c = 0; c < n; c++) for (let r = 0; r < 2; r++) order.push([r, c])
  const free = (r, c) => r >= 0 && r < 2 && c >= 0 && c < n && !filled[r][c]
  function fill(idx) {
    while (idx < order.length && filled[order[idx][0]][order[idx][1]]) idx++
    if (idx === order.length) return 1
    const [r, c] = order[idx]
    const block = [[0, c], [1, c], [0, c + 1], [1, c + 1]]
    const pieces = [[[r, c], [r, c + 1]], [[r, c], [r + 1, c]]]
    for (const removed of block) {
      if (removed[0] === r && removed[1] === c) continue
      pieces.push(block.filter(cell => cell !== removed))
    }
    let total = 0
    for (const piece of pieces) {
      if (!piece.every(([pr, pc]) => free(pr, pc))) continue
      for (const [pr, pc] of piece) filled[pr][pc] = true
      total += fill(idx + 1)
      for (const [pr, pc] of piece) filled[pr][pc] = false
    }
    return total
  }
  return fill(0)
}

test('790 small widths', () => {
  assert.equal(buildTrace(1).result, 1)
  assert.equal(buildTrace(2).result, 2)
  assert.equal(buildTrace(3).result, 5)
  assert.equal(buildTrace(4).result, 11)
})

test('790 widths up to 12 match a direct tiling count', () => {
  for (let n = 1; n <= 12; n++) assert.equal(buildTrace(n).result, countTilings(n), `width ${n}`)
})

test('790 rejects n above 60', () => {
  assert.throws(() => parseInput('61'))
})
