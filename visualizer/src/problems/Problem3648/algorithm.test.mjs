import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3648 official examples', () => {
  assert.equal(solve({ n: 5, m: 5, k: 1 }), 4)
  assert.equal(solve({ n: 2, m: 2, k: 2 }), 1)
})

test('3648 k = 0 needs one sensor per cell', () => {
  assert.equal(solve({ n: 3, m: 2, k: 0 }), 6)
})

test('3648 rejects a zero dimension and a negative k', () => {
  assert.throws(() => parseInput('{"n":0,"m":2,"k":1}'))
  assert.throws(() => parseInput('{"n":2,"m":2,"k":-1}'))
})

// Independent oracle: exact minimum set cover by trying every subset of cells as sensor positions.
function oracle({ n, m, k }) {
  const cells = n * m
  let best = Infinity
  for (let mask = 1; mask < 1 << cells; mask++) {
    const count = mask.toString(2).split('').filter(b => b === '1').length
    if (count >= best) continue
    const covered = new Array(cells).fill(false)
    for (let s = 0; s < cells; s++) {
      if (!(mask & (1 << s))) continue
      const sr = Math.floor(s / m), sc = s % m
      for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) {
        if (Math.max(Math.abs(r - sr), Math.abs(c - sc)) <= k) covered[r * m + c] = true
      }
    }
    if (covered.every(Boolean)) best = count
  }
  return best
}

test('3648 small grids match an exact set-cover oracle', () => {
  let seed = 3648
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = q => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % q }
  for (let t = 0; t < 120; t++) {
    const input = { n: 1 + rnd(4), m: 1 + rnd(4), k: rnd(3) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
