import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = (a, b) => buildTrace(parseInput(JSON.stringify({ root1: a, root2: b }))).result
// Oracle: canonical form with children sorted lexicographically.
const canon = n => (n ? (() => { const kids = [canon(n.left), canon(n.right)].sort(); return `(${n.value}${kids[0]}${kids[1]})` })() : '.')
const oracle = (a, b) => canon(treeFromLevelOrder(a)) === canon(treeFromLevelOrder(b))
test('official examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 6, null, null, null, 7, 8], [1, 3, 2, null, 6, 4, 5, null, null, null, null, 8, 7]), true)
  assert.equal(solve([], []), true)
  assert.equal(solve([], [1]), false)
})
test('random level-order trees against canonical-form oracle', () => {
  let seed = 13; const rnd = n => Math.floor(((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * n)
  const gen = () => { const len = rnd(8); if (!len) return []; const a = [rnd(3)]; for (let i = 1; i < len; i++) a.push(rnd(4) ? rnd(3) : null); return a }
  let eq = 0
  for (let t = 0; t < 1500; t++) {
    const a = gen()
    const b = rnd(2) ? gen() : (() => { // build a flipped version by swapping children of random nodes
      const root = treeFromLevelOrder(a); if (!root) return []
      const flip = n => { if (!n) return; if (rnd(2)) [n.left, n.right] = [n.right, n.left]; flip(n.left); flip(n.right) }
      flip(root)
      const out = [], q = [root]
      while (q.length) { const n = q.shift(); if (!n) { out.push(null); continue } out.push(n.value); q.push(n.left, n.right) }
      while (out.at(-1) === null) out.pop()
      return out
    })()
    const r = solve(a, b)
    assert.equal(r, oracle(a, b), JSON.stringify([a, b]))
    if (r) eq++
  }
  assert.ok(eq > 100)
})
test('trace ends in done', () => {
  const t = buildTrace(parseInput('{"root1":[1,2,3],"root2":[1,3,2]}'))
  assert.equal(t.frames[0].phase, 'start'); assert.equal(t.frames.at(-1).phase, 'done')
})
test('rejects bad input', () => {
  for (const bad of ['[1]', '{"root1":[1]}', '{"root1":[null],"root2":[]}', '{"root1":["a"],"root2":[]}', '{"root1":[100],"root2":[]}']) assert.throws(() => parseInput(bad))
})
