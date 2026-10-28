import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: try every way to remove bars; the remaining lines split the grid, and a hole is a
// square between two consecutive remaining lines in both directions.
function oracle({ n, m, h_bars, v_bars }) {
  let best = 1
  const linesAfter = (total, bars, mask) => {
    const lines = []
    for (let x = 1; x <= total + 2; x++) {
      const idx = bars.indexOf(x)
      if (idx >= 0 && (mask >> idx) & 1) continue
      lines.push(x)
    }
    return lines
  }
  const gaps = lines => lines.slice(1).map((v, i) => v - lines[i])
  for (let hm = 0; hm < 1 << h_bars.length; hm++) {
    for (let vm = 0; vm < 1 << v_bars.length; vm++) {
      const hg = gaps(linesAfter(n, h_bars, hm))
      const vg = gaps(linesAfter(m, v_bars, vm))
      for (const g of hg) if (vg.includes(g)) best = Math.max(best, g * g)
    }
  }
  return best
}

test('2943 examples', () => {
  assert.equal(solve({ n: 2, m: 1, h_bars: [2, 3], v_bars: [2] }), 4)
  assert.equal(solve({ n: 1, m: 1, h_bars: [2], v_bars: [2] }), 4)
  assert.equal(solve({ n: 2, m: 3, h_bars: [2, 3], v_bars: [2, 4] }), 4)
})

test('2943 rejects a bar outside the grid', () => {
  assert.throws(() => parseInput('{"n":2,"m":2,"h_bars":[5],"v_bars":[2]}'))
})

test('2943 random grids match a line-removal oracle', () => {
  let seed = 2943
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const bars = (top) => {
    const all = []
    for (let x = 2; x <= top + 1; x++) all.push(x)
    return all.filter(() => rnd(2) === 1).slice(0, 4)
  }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(5)
    const m = 1 + rnd(5)
    const input = { n, m, h_bars: bars(n), v_bars: bars(m) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
