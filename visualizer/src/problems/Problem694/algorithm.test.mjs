import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = rows => buildTrace(rows).result

test('694 translated islands count once; a different shape counts again', () => {
  assert.equal(solve(['11000', '10000', '00011', '00001']), 2)
  assert.equal(solve(['11000', '10000', '00011', '00011']), 2)
  // The third grid is the first island moved down and right, so it is a translated copy.
  assert.equal(solve(['1100', '1000', '0011', '0010']), 1)
})

test('694 a mirror image is a different shape', () => {
  assert.equal(solve(['110', '100', '000', '011', '001']), 2)
})

test('694 rejects ragged rows', () => {
  assert.throws(() => parseInput('["11","1"]'))
})

// Independent oracle: flood-fill each island, shift it to the origin, and compare the sorted cell lists.
function oracle(rows) {
  const height = rows.length, width = rows[0].length
  const seen = new Set()
  const keys = new Set()
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (rows[r][c] !== '1' || seen.has(`${r},${c}`)) continue
      const cells = []
      const queue = [[r, c]]
      seen.add(`${r},${c}`)
      while (queue.length) {
        const [y, x] = queue.shift()
        cells.push([y, x])
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ny = y + dy, nx = x + dx
          if (ny < 0 || nx < 0 || ny >= height || nx >= width || rows[ny][nx] !== '1' || seen.has(`${ny},${nx}`)) continue
          seen.add(`${ny},${nx}`)
          queue.push([ny, nx])
        }
      }
      const minY = Math.min(...cells.map(([y]) => y)), minX = Math.min(...cells.map(([, x]) => x))
      keys.add(cells.map(([y, x]) => `${y - minY},${x - minX}`).sort().join(';'))
    }
  }
  return keys.size
}

test('694 random grids match a flood-fill oracle', () => {
  let seed = 61
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const height = 1 + rnd(6), width = 1 + rnd(6)
    const rows = Array.from({ length: height }, () => Array.from({ length: width }, () => (rnd(2) ? '1' : '0')).join(''))
    assert.equal(solve(rows), oracle(rows), JSON.stringify(rows))
  }
})
