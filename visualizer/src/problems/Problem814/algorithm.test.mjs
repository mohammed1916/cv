import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

// Oracle: keep exactly the nodes that are a 1 or an ancestor of a 1 (parent-map walk, no recursion on subtrees).
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const parent = new Map(), all = [], q = [root]
  for (let i = 0; i < q.length; i++) {
    const n = q[i]; all.push(n)
    for (const c of [n.left, n.right]) if (c) { parent.set(c, n); q.push(c) }
  }
  const keep = new Set()
  for (const n of all) if (n.value === 1) for (let a = n; a && !keep.has(a); a = parent.get(a)) keep.add(a)
  const copy = n => (n && keep.has(n) ? { id: n.id, value: n.value, left: copy(n.left), right: copy(n.right) } : null)
  return levelOrderFromTree(copy(root))
}
test('official examples', () => {
  assert.deepEqual(buildTrace(parseInput('[1,null,0,0,1]')).result, [1, null, 0, null, 1])
  assert.deepEqual(buildTrace(parseInput('[1,0,1,0,0,0,1]')).result, [1, null, 1, null, 1])
  assert.deepEqual(buildTrace(parseInput('[1,1,0,1,1,0,1,0]')).result, [1, 1, 0, 1, 1, null, 1])
})
test('random trees vs ancestor-of-one oracle', () => {
  let seed = 13
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(14)
    const arr = [rnd(2)]
    let slots = 2
    while (arr.length < n && slots > 0) { const v = rnd(4) ? rnd(2) : null; arr.push(v); slots--; if (v !== null) slots += 2 }
    while (arr.length && arr[arr.length - 1] === null) arr.pop()
    const r = buildTrace(parseInput(JSON.stringify(arr)))
    const o = arr.includes(1) ? oracle(arr) : []
    assert.deepEqual(r.result, o, JSON.stringify(arr))
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[null]'))
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[1,null,null,1]'))
})
