import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, queries) => buildTrace({ s, queries }).result

test('3777 hand-checked small cases', () => {
  assert.deepEqual(solve('ABA', [[2, 0, 2]]), [0])
  assert.deepEqual(solve('AAA', [[2, 0, 2]]), [2])
  assert.deepEqual(solve('ABB', [[2, 0, 2], [1, 2], [2, 0, 2]]), [1, 0])
})

// Independent oracle: try every kept subset of the substring and keep the longest alternating one.
function bruteDeletions(s, l, r) {
  const sub = s.slice(l, r + 1)
  const n = sub.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let kept = ''
    for (let i = 0; i < n; i++) if (mask & (1 << i)) kept += sub[i]
    let ok = true
    for (let i = 0; i + 1 < kept.length; i++) if (kept[i] === kept[i + 1]) { ok = false; break }
    if (ok && kept.length > best) best = kept.length
  }
  return n - best
}

test('3777 matches a brute-force subset oracle with flips', () => {
  let seed = 11
  const next = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % m }
  for (let t = 0; t < 120; t++) {
    const n = 1 + next(9)
    const initial = Array.from({ length: n }, () => (next(2) ? 'A' : 'B')).join('')
    let s = initial
    const queries = []
    const expected = []
    for (let q = 0; q < 6; q++) {
      if (next(2)) {
        const j = next(n)
        queries.push([1, j])
        s = s.slice(0, j) + (s[j] === 'A' ? 'B' : 'A') + s.slice(j + 1)
      } else {
        const l = next(n)
        const r = l + next(n - l)
        queries.push([2, l, r])
        expected.push(bruteDeletions(s, l, r))
      }
    }
    assert.deepEqual(solve(initial, queries), expected)
  }
})

test('3777 rejects a query with reversed bounds', () => {
  assert.throws(() => parseInput('{"s":"AB","queries":[[2,1,0]]}'))
})
