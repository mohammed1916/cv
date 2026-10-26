import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result
// Oracle: try every subset of kept columns and check lexicographic order.
function oracle(strs) {
  const m = strs[0].length
  let best = m
  for (let keep = 0; keep < 1 << m; keep++) {
    const rows = strs.map(s => [...s].filter((_, c) => keep >> c & 1).join(''))
    if (rows.every((r, i) => i === 0 || rows[i - 1] <= r)) best = Math.min(best, m - keep.toString(2).split('1').length + 1)
  }
  return best
}
test('official examples', () => {
  assert.equal(solve(['ca', 'bb', 'ac']), 1)
  assert.equal(solve(['xc', 'yb', 'za']), 0)
  assert.equal(solve(['zyx', 'wvu', 'tsr']), 3)
})
test('random string lists vs subset-of-columns oracle', () => {
  let seed = 21; const rnd = n => Math.floor(((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * n)
  for (let t = 0; t < 800; t++) {
    const n = 1 + rnd(4), m = 1 + rnd(5)
    const strs = Array.from({ length: n }, () => Array.from({ length: m }, () => 'abc'[rnd(3)]).join(''))
    assert.equal(solve(strs), oracle(strs), JSON.stringify(strs))
  }
})
test('rejects bad input', () => {
  for (const bad of ['[]', '["a","bb"]', '["A"]', '[1]', '"abc"']) assert.throws(() => parseInput(bad))
})
