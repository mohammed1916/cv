import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = v => buildTrace(parseInput(JSON.stringify(v)))
// Oracle: build a BST by inserting random distinct values, serialise level-order, and brute-force all pairs.
function insert(node, v) {
  if (!node) return { v, l: null, r: null }
  if (v < node.v) node.l = insert(node.l, v); else node.r = insert(node.r, v)
  return node
}
function levelOrder(root) {
  const out = [], q = [root]
  while (q.length) { const n = q.shift(); if (n === null) { out.push(null); continue } out.push(n.v); q.push(n.l, n.r) }
  while (out.at(-1) === null) out.pop()
  return out
}
test('official examples', () => {
  assert.equal(run([4, 2, 6, 1, 3]).result, 1)
  assert.equal(run([1, 0, 48, null, null, 12, 49]).result, 1)
})
test('random BSTs match all-pairs brute force', () => {
  let seed = 13
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 300; t++) {
    const vals = [...new Set(Array.from({ length: 2 + rnd(10) }, () => rnd(60)))]
    if (vals.length < 2) continue
    let root = null
    for (const v of vals) root = insert(root, v)
    let best = Infinity
    for (let i = 0; i < vals.length; i++) for (let j = i + 1; j < vals.length; j++) best = Math.min(best, Math.abs(vals[i] - vals[j]))
    const arr = levelOrder(root)
    const r = run(arr)
    assert.equal(r.result, best, JSON.stringify(arr))
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('[2,3,1]'))
  assert.throws(() => parseInput('[null,1]'))
  assert.throws(() => parseInput('"x"'))
})
