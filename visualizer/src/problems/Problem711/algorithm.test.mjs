import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = rows => buildTrace(rows).result

test('711 a mirror image counts as the same shape', () => {
  // The L-shaped island and its mirror image are one shape once reflections are allowed.
  assert.equal(solve(['11000', '10000', '00011', '00001']), 1)
})

test('711 different shapes stay separate', () => {
  // An L-shaped island and a 2x2 square are different shapes.
  assert.equal(solve(['11000', '10000', '00011', '00011']), 2)
})

test('711 rejects ragged rows', () => {
  assert.throws(() => parseInput('["11","1"]'))
})

// Independent oracle: flood-fill each island, then take the smallest normalized form over
// four rotations, each with and without a reflection, written as explicit repeated steps.
function oracle(rows) {
  const height = rows.length, width = rows[0].length
  const seen = new Set()
  const keys = new Set()
  const rotate = ([r, c]) => [c, -r]
  const reflect = ([r, c]) => [r, -c]
  const normalized = cells => {
    const minR = Math.min(...cells.map(([r]) => r)), minC = Math.min(...cells.map(([, c]) => c))
    return cells.map(([r, c]) => `${r - minR},${c - minC}`).sort().join(';')
  }
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
      const images = []
      let current = cells
      for (let turn = 0; turn < 4; turn++) {
        images.push(normalized(current), normalized(current.map(reflect)))
        current = current.map(rotate)
      }
      keys.add(images.sort()[0])
    }
  }
  return keys.size
}

test('711 random grids match a flood-fill oracle', () => {
  let seed = 83
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const height = 1 + rnd(6), width = 1 + rnd(6)
    const rows = Array.from({ length: height }, () => Array.from({ length: width }, () => (rnd(2) ? '1' : '0')).join(''))
    assert.equal(solve(rows), oracle(rows), JSON.stringify(rows))
  }
})
