import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = a => buildTrace(parseInput(JSON.stringify(a))).result
// Oracle: heap indexing. Complete iff node indices are exactly 1..count.
function oracle(a) {
  const root = treeFromLevelOrder(a)
  const idx = []
  const go = (n, i) => { if (!n) return; idx.push(i); go(n.left, 2 * i); go(n.right, 2 * i + 1) }
  go(root, 1)
  return Math.max(...idx) === idx.length
}
test('official examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 6]), true)
  assert.equal(solve([1, 2, 3, 4, 5, null, 7]), false)
})
test('random trees vs heap-index oracle', () => {
  let seed = 31; const rnd = n => Math.floor(((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * n)
  let yes = 0
  for (let t = 0; t < 2000; t++) {
    const len = 1 + rnd(12)
    const a = [1]
    for (let i = 1; i < len; i++) a.push(rnd(5) ? i + 1 : null)
    const r = solve(a)
    assert.equal(r, oracle(a), JSON.stringify(a))
    if (r) yes++
  }
  assert.ok(yes > 100)
})
test('trace ends in done', () => {
  const t = buildTrace([1, 2, 3])
  assert.equal(t.frames[0].phase, 'start'); assert.equal(t.frames.at(-1).phase, 'done')
})
test('rejects bad input', () => {
  for (const bad of ['[]', '[null,1]', '["a"]', '[0]', '5']) assert.throws(() => parseInput(bad))
})
