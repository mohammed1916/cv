import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2056 a lone rook reaches 14 squares and may stay, giving 15', () => {
  assert.equal(solve({ pieces: ['rook'], positions: [[1, 1]] }), 15)
})

test('2056 a lone bishop on d5 reaches 11 squares and may stay, giving 12', () => {
  // From (4, 3): up-right 4, down-right 2, up-left 3, down-left 2 squares; 11 moves plus staying put.
  assert.equal(solve({ pieces: ['bishop'], positions: [[4, 3]] }), 12)
})

test('2056 rejects two pieces on one square', () => {
  assert.throws(() => parseInput('{"pieces":["rook","bishop"],"positions":[[1,1],[1,1]]}'))
})

// Independent oracle: enumerate every combination of destinations and step each piece one square at a time.
function oracle({ pieces, positions }) {
  const reach = (kind, [r, c]) => {
    const out = []
    for (let R = 1; R <= 8; R++) for (let C = 1; C <= 8; C++) {
      const dr = Math.abs(R - r)
      const dc = Math.abs(C - c)
      if (dr === 0 && dc === 0) out.push([R, C])
      else if ((kind === 'rook' || kind === 'queen') && (dr === 0 || dc === 0)) out.push([R, C])
      else if ((kind === 'bishop' || kind === 'queen') && dr === dc) out.push([R, C])
    }
    return out
  }
  const pathTo = (start, dest) => {
    const path = [start]
    let [r, c] = start
    while (r !== dest[0] || c !== dest[1]) {
      r += Math.sign(dest[0] - r)
      c += Math.sign(dest[1] - c)
      path.push([r, c])
    }
    return path
  }
  const options = pieces.map((kind, i) => reach(kind, positions[i]))
  let count = 0
  const combo = []
  const walk = i => {
    if (i === pieces.length) {
      const paths = combo.map((dest, j) => pathTo(positions[j], dest))
      const T = Math.max(...paths.map(p => p.length))
      const at = (p, t) => p[Math.min(t, p.length - 1)]
      for (let t = 0; t < T; t++) {
        for (let a = 0; a < paths.length; a++) for (let b = a + 1; b < paths.length; b++) {
          const p = at(paths[a], t)
          const q = at(paths[b], t)
          if (p[0] === q[0] && p[1] === q[1]) return
        }
      }
      count++
      return
    }
    for (const dest of options[i]) {
      combo.push(dest)
      walk(i + 1)
      combo.pop()
    }
  }
  walk(0)
  return count
}

test('2056 random placements match a step-by-step oracle', () => {
  let seed = 2056
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const kinds = ['rook', 'queen', 'bishop']
  for (let t = 0; t < 40; t++) {
    const count = 1 + rnd(2)
    const squares = []
    while (squares.length < count) {
      const sq = [1 + rnd(8), 1 + rnd(8)]
      if (!squares.some(s => s[0] === sq[0] && s[1] === sq[1])) squares.push(sq)
    }
    const pieces = squares.map(() => kinds[rnd(3)])
    const input = { pieces, positions: squares }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
