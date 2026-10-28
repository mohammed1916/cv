import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, restrictions, diff) => buildTrace({ n, restrictions, diff }).result

test('3796 official examples', () => {
  assert.equal(solve(10, [[3, 1], [8, 1]], [2, 2, 3, 1, 4, 5, 1, 1, 2]), 6)
  assert.equal(solve(8, [[3, 2]], [3, 5, 2, 4, 2, 3, 1]), 12)
})

test('3796 edge case: a single step with no restriction', () => {
  assert.equal(solve(2, [[1, 5]], [3]), 3)
})

test('3796 rejects a repeated idx', () => {
  assert.throws(() => parseInput('{"n":3,"restrictions":[[1,2],[1,3]],"diff":[1,1]}'))
})

// Independent oracle: enumerate every valid sequence a[0..n-1] with a[0] = 0 by depth-first search and keep the largest maximum.
function oracle(n, restrictions, diff) {
  const cap = new Map(restrictions)
  const bound = diff.reduce((s, d) => s + d, 0)
  let best = 0
  const dfs = (i, prev, peak) => {
    if (i === n) { best = Math.max(best, peak); return }
    for (let v = Math.max(0, prev - diff[i - 1]); v <= Math.min(bound, prev + diff[i - 1]); v++) {
      if (cap.has(i) && v > cap.get(i)) continue
      dfs(i + 1, v, Math.max(peak, v))
    }
  }
  dfs(1, 0, 0)
  return best
}

test('3796 random small inputs match a sequence-enumeration oracle', () => {
  let seed = 3796
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = rnd(5) + 2
    const diff = Array.from({ length: n - 1 }, () => rnd(4) + 1)
    const idxs = []
    for (let i = 1; i < n; i++) if (rnd(2)) idxs.push(i)
    if (idxs.length === 0) idxs.push(1)
    const restrictions = idxs.map(i => [i, rnd(6) + 1])
    assert.equal(solve(n, restrictions, diff), oracle(n, restrictions, diff), JSON.stringify({ n, restrictions, diff }))
  }
})
