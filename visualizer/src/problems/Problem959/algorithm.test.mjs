import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: each cell becomes a 3 x 3 block of pixels, the slash or backslash becomes a wall of
// pixels, and the open pixels are counted as connected components.
function pixelRegions(grid) {
  const n = grid.length
  const size = 3 * n
  const open = Array.from({ length: size }, () => Array(size).fill(true))
  grid.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === '/') [[0, 2], [1, 1], [2, 0]].forEach(([y, x]) => { open[3 * r + y][3 * c + x] = false })
    if (ch === '\\') [[0, 0], [1, 1], [2, 2]].forEach(([y, x]) => { open[3 * r + y][3 * c + x] = false })
  }))
  let count = 0
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (!open[y][x]) continue
    count++
    const stack = [[y, x]]
    open[y][x] = false
    while (stack.length) {
      const [cy, cx] = stack.pop()
      for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ny = cy + dy, nx = cx + dx
        if (ny >= 0 && nx >= 0 && ny < size && nx < size && open[ny][nx]) {
          open[ny][nx] = false
          stack.push([ny, nx])
        }
      }
    }
  }
  return count
}

test('959 regions cut by slashes match a pixel oracle', () => {
  const samples = [
    ['  ', '  '], [' /', '/ '], ['/\\', '\\/'], ['//', '//'], ['   ', ' / ', '   '],
    ['\\\\\\', '/ /', '\\ /'], ['   ', '   ', '   '], ['/\\ ', '\\/ ', '   '], ['/  ', '  /', '/  '],
  ]
  for (const grid of samples) {
    const got = buildTrace(parseInput(JSON.stringify({ grid }))).result
    assert.equal(got, pixelRegions(grid), JSON.stringify(grid))
  }
})

test('959 rejects rows of the wrong shape', () => {
  assert.throws(() => parseInput('{"grid":["/ ","/"]}'))
  assert.throws(() => parseInput('{"grid":["ab","  "]}'))
})
