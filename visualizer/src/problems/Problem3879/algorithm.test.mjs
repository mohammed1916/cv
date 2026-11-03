import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, buildTree, parseInput } from './algorithm.js'

const solve = tree => buildTrace({ tree }).result

// Oracle: test every pair of nodes; the unique tree path between them is checked directly.
function oracle(tree) {
  const { nodes } = buildTree(tree)
  const parent = new Map()
  const stack = [nodes[0]]
  const seen = new Set([nodes[0].id])
  while (stack.length) {
    const node = stack.pop()
    for (const child of [node.left, node.right]) {
      if (child && !seen.has(child.id)) {
        seen.add(child.id)
        parent.set(child.id, node)
        stack.push(child)
      }
    }
  }
  const depth = n => { let d = 0; for (let x = n; parent.has(x.id); x = parent.get(x.id)) d += 1; return d }
  const pathBetween = (a, b) => {
    const left = [], right = []
    let x = a, y = b
    while (depth(x) > depth(y)) { left.push(x); x = parent.get(x.id) }
    while (depth(y) > depth(x)) { right.push(y); y = parent.get(y.id) }
    while (x !== y) { left.push(x); right.push(y); x = parent.get(x.id); y = parent.get(y.id) }
    return [...left, x, ...right.reverse()]
  }
  let best = -Infinity
  for (const a of nodes) {
    for (const b of nodes) {
      const path = pathBetween(a, b)
      if (new Set(path.map(n => n.val)).size !== path.length) continue
      best = Math.max(best, path.reduce((s, n) => s + n.val, 0))
    }
  }
  return best
}

test('3879 hand-checked presets', () => {
  assert.equal(solve([4, -2, 6, 1, null, 5, -7]), oracle([4, -2, 6, 1, null, 5, -7]))
  assert.equal(solve([1, 1, 1]), 1)
})

test('3879 a single node is its own path', () => {
  assert.equal(solve([-5]), -5)
})

test('3879 a repeated value cannot appear twice on one path', () => {
  assert.equal(solve([2, 2, null, 2]), 2)
})

test('3879 parser rejects an empty root and too many nodes', () => {
  assert.throws(() => parseInput('{"tree":[null,1]}'))
  assert.throws(() => parseInput('{"tree":[1,2,3,4,5,6,7,8,9,1,2,3,4]}'))
})

test('3879 frames end with the result', () => {
  const run = buildTrace({ tree: [3, 1, 4, null, 2] })
  assert.equal(run.frames.at(-1).sum, run.result)
})

test('3879 matches the pairwise path oracle on random trees', () => {
  let seed = 3879
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const size = 1 + rnd(9)
    const tree = [rnd(7) - 3]
    let nodes = 1
    for (let q = 0, slot = 0; nodes < size && slot < 30; slot += 1) {
      const onLevel = q
      if (onLevel === tree.length) break
      tree.push(rnd(3) === 0 ? null : rnd(7) - 3)
      if (tree[tree.length - 1] !== null) nodes += 1
      q += 1
      if (q >= 2 * nodes) break
    }
    while (tree.length && tree.at(-1) === null) tree.pop()
    if (!tree.length) continue
    assert.equal(solve(tree), oracle(tree), JSON.stringify(tree))
  }
})
