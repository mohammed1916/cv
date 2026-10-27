import test from 'node:test'
import assert from 'node:assert/strict'
import { SegTree, describeSegtreeOps, segtreeLayout, segtreeRoles } from './segtreeModel.js'

let seed = 7
const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % k }

const brute = {
  'sum-add': { upd: (a, l, r, t) => { for (let i = l; i <= r; i++) a[i] += t }, qry: (a, l, r) => a.slice(l, r + 1).reduce((x, y) => x + y, 0), tag: () => rand(7) - 3 },
  'max-add': { upd: (a, l, r, t) => { for (let i = l; i <= r; i++) a[i] += t }, qry: (a, l, r) => Math.max(...a.slice(l, r + 1)), tag: () => rand(5) },
  'max-assign': { upd: (a, l, r, t) => { for (let i = l; i <= r; i++) a[i] = t }, qry: (a, l, r) => Math.max(...a.slice(l, r + 1)), tag: () => rand(20) },
  'cover-assign': { upd: (a, l, r, t) => { for (let i = l; i <= r; i++) a[i] = t }, qry: (a, l, r) => a.slice(l, r + 1).reduce((x, y) => x + y, 0), tag: () => rand(2) },
}

for (const mode of Object.keys(brute)) {
  test(`${mode}: random updates and queries match a plain array`, () => {
    for (let trial = 0; trial < 60; trial++) {
      const n = 1 + rand(13)
      const tree = new SegTree(n, mode)
      const plain = Array(n).fill(0)
      for (let step = 0; step < 25; step++) {
        const l = rand(n), r = l + rand(n - l)
        if (rand(2)) { const t = brute[mode].tag(); tree.update(l, r, t); brute[mode].upd(plain, l, r, t) }
        else assert.equal(tree.query(l, r), brute[mode].qry(plain, l, r), `${mode} n=${n} [${l},${r}]`)
        tree.snapshot()
      }
    }
  })
}

test('fully covered nodes partition the query range exactly', () => {
  const tree = new SegTree(10, 'sum-add')
  tree.update(2, 8, 1)
  const covered = tree.snapshot().ops.filter(op => op.type === 'visit' && op.kind === 'covered')
  const leaves = covered.flatMap(op => Array.from({ length: op.hi - op.lo + 1 }, (_, i) => op.lo + i)).sort((a, b) => a - b)
  assert.deepEqual(leaves, [2, 3, 4, 5, 6, 7, 8])
})

test('lazy tags stay on covered inner nodes and are pushed down by a later partial visit', () => {
  const tree = new SegTree(8, 'sum-add')
  tree.update(0, 3, 5)
  const first = tree.snapshot()
  assert.equal(first.nodes.find(node => node.lo === 0 && node.hi === 3).tag, '+5')
  assert.equal(first.nodes.find(node => node.lo === 0 && node.hi === 1).tag, '')
  assert.equal(tree.query(1, 1), 5)
  const second = tree.snapshot()
  const push = second.ops.find(op => op.type === 'push' && op.lo === 0 && op.hi === 3)
  assert.ok(push, 'tag on [0,3] was pushed to its children')
  assert.equal(second.nodes.find(node => node.lo === 0 && node.hi === 3).tag, '')
  assert.equal(second.nodes.find(node => node.lo === 2 && node.hi === 3).tag, '+5')
  assert.equal(segtreeRoles(second.ops)[push.id], 'pushed')
})

test('describeSegtreeOps words every kind of operation', () => {
  const tree = new SegTree(4, 'max-add')
  tree.update(0, 1, 2)
  tree.snapshot()
  tree.query(1, 2)
  const text = describeSegtreeOps(tree.snapshot().ops).join('\n')
  assert.match(text, /Query \[1, 2\]/)
  assert.match(text, /Push down: node \[0, 3\]|Push down: node \[0, 1\]/)
  assert.match(text, /fully covered: take its stored value/)
  assert.match(text, /does not overlap/)
  tree.update(0, 3, 1)
  const update = describeSegtreeOps(tree.snapshot().ops).join('\n')
  assert.match(update, /apply \+1 to it/)
})

test('layout puts every node at its depth centred over its leaves', () => {
  const laid = segtreeLayout(new SegTree(4, 'sum-add').snapshot().nodes)
  const root = laid.find(node => node.id === 1)
  assert.deepEqual([root.depth, root.center], [0, 2])
  assert.equal(laid.find(node => node.id === 4).center, 0.5)
})
