import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1039 official examples', () => {
  assert.equal(solve({ values: [1, 2, 3] }), 6)
  assert.equal(solve({ values: [3, 7, 4, 5] }), 144)
  assert.equal(solve({ values: [1, 3, 1, 4, 1, 5] }), 13)
})

test('1039 rejects a polygon with fewer than three vertices', () => {
  assert.throws(() => parseInput('{"values":[1,2]}'))
})

// Independent oracle: list every set of n-3 non-crossing diagonals (each is a triangulation),
// find the triangles whose three sides are all present, and keep the cheapest total.
function oracle(values) {
  const n = values.length
  const diagonals = []
  for (let a = 0; a < n; a++) for (let b = a + 2; b < n; b++) if (!(a === 0 && b === n - 1)) diagonals.push([a, b])
  const sides = new Set()
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    sides.add(`${Math.min(i, j)},${Math.max(i, j)}`)
  }
  const crosses = ([a, b], [c, d]) => (a < c && c < b && b < d) || (c < a && a < d && d < b)
  let best = Infinity
  const choose = (start, chosen) => {
    if (chosen.length === n - 3) {
      if (chosen.some((p, x) => chosen.some((q, y) => y > x && crosses(p, q)))) return
      const present = new Set([...sides, ...chosen.map(([a, b]) => `${a},${b}`)])
      let total = 0
      let faces = 0
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) {
        if (present.has(`${a},${b}`) && present.has(`${b},${c}`) && present.has(`${a},${c}`)) {
          total += values[a] * values[b] * values[c]
          faces++
        }
      }
      if (faces === n - 2) best = Math.min(best, total)
      return
    }
    for (let k = start; k < diagonals.length; k++) choose(k + 1, [...chosen, diagonals[k]])
  }
  choose(0, [])
  return best
}

test('1039 seeded random polygons match a diagonal-set oracle', () => {
  let seed = 1039
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const values = Array.from({ length: 3 + rnd(5) }, () => 1 + rnd(20))
    assert.equal(solve({ values }), oracle(values), JSON.stringify(values))
  }
})
