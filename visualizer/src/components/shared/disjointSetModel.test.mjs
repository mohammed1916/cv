import test from 'node:test'
import assert from 'node:assert/strict'
import { AuthoredUnionFind, unionState } from '../../problems/families/collectionStories/authoredUnionFind.js'
import { describeDisjointSetOps, disjointSetForest } from './disjointSetModel.js'

test('find records the walked chain and what path compression re-pointed', () => {
  const dsu = new AuthoredUnionFind(5)
  dsu.parent = [0, 0, 1, 2, 3] // chain 4 → 3 → 2 → 1 → 0
  dsu.takeOps()
  assert.equal(dsu.find(4), 0)
  const [op] = dsu.takeOps()
  assert.deepEqual(op.chain, [4, 3, 2, 1, 0])
  assert.equal(op.root, 0)
  assert.ok(op.repointed.length > 0)
  assert.ok(op.repointed.every(node => dsu.parent[node] !== [0, 0, 1, 2, 3][node]))
})

test('union logs both finds then the merge decision, smaller tree under larger', () => {
  const dsu = new AuthoredUnionFind(4)
  dsu.union(0, 1)
  dsu.union(2, 0)
  const ops = dsu.takeOps()
  const merges = ops.filter(op => op.type === 'union')
  assert.equal(merges.length, 2)
  assert.equal(merges[1].merged, true)
  assert.equal(merges[1].winner, 0)
  assert.equal(merges[1].loser, 2)
  assert.equal(merges[1].winnerSize, 2)
  assert.equal(merges[1].loserSize, 1)
  assert.equal(dsu.union(1, 2), false)
  assert.equal(dsu.takeOps().at(-1).merged, false)
})

test('showing state never changes the structure or logs operations', () => {
  const dsu = new AuthoredUnionFind(6)
  dsu.union(0, 1); dsu.union(2, 3); dsu.union(1, 3)
  dsu.takeOps()
  const before = [...dsu.parent]
  unionState(dsu, ['a', 'b', 'c', 'd', 'e', 'f'])
  assert.deepEqual(dsu.parent, before)
  assert.equal(dsu.takeOps().length, 0)
})

test('unionState exposes parent, size, labels and drains the operations once', () => {
  const dsu = new AuthoredUnionFind(3)
  dsu.union(0, 1)
  const first = unionState(dsu).dsu
  assert.deepEqual(first.parent, [0, 0, 2])
  assert.deepEqual(first.labels, ['0', '1', '2'])
  assert.ok(first.ops.length >= 3)
  assert.equal(unionState(dsu).dsu.ops.length, 0)
})

test('every set appears as exactly one tree and every element once', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(10)
    const dsu = new AuthoredUnionFind(n)
    for (let k = rand(12); k > 0; k--) dsu.union(rand(n), rand(n))
    const labels = Array.from({ length: n }, (_, i) => `v${i}`)
    const { roots } = disjointSetForest(dsu.parent, labels)
    const seen = []
    const walk = node => { seen.push(node.id); node.children.forEach(walk) }
    roots.forEach(walk)
    assert.equal(roots.length, dsu.count)
    assert.deepEqual([...seen].sort(), [...labels].sort())
  }
})

test('descriptions name the chain, the compression and the merge decision', () => {
  const lines = describeDisjointSetOps([
    { type: 'find', node: 4, chain: [4, 3, 0], root: 0, repointed: [4] },
    { type: 'union', a: 1, b: 2, rootA: 0, rootB: 2, merged: true, winner: 0, loser: 2, winnerSize: 3, loserSize: 1 },
    { type: 'union', a: 1, b: 3, rootA: 0, rootB: 0, merged: false },
  ], i => `n${i}`)
  assert.match(lines[0], /n4 → n3 → n0/)
  assert.match(lines[0], /Path compression re-points n4/)
  assert.match(lines[1], /smaller tree \(root n2, size 1\).*under root n0 \(size 3\).*size 4/)
  assert.match(lines[2], /nothing changes/)
})

test('equal-sized trees are described as a tie, not as smaller and larger', () => {
  const [line] = describeDisjointSetOps([{ type: 'union', a: 0, b: 1, rootA: 0, rootB: 1, merged: true, winner: 0, loser: 1, winnerSize: 1, loserSize: 1 }], i => `n${i}`)
  assert.match(line, /Both trees have size 1, so root n1 hangs under root n0, giving size 2/)
  assert.doesNotMatch(line, /smaller tree/)
})
