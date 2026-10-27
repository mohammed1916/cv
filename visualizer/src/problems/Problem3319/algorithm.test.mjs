import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: test each subtree directly by checking every node's children and leaf depths.
function oracle(tree, k) {
  const sizesOf = []
  const count = n => (n ? 1 + count(n.left) + count(n.right) : 0)
  const isPerfect = top => {
    let leafDepth = null
    let ok = true
    const walk = (n, depth) => {
      if (!n) return
      if (!n.left && !n.right) {
        if (leafDepth === null) leafDepth = depth
        else if (leafDepth !== depth) ok = false
        return
      }
      if (!n.left || !n.right) { ok = false; return }
      walk(n.left, depth + 1)
      walk(n.right, depth + 1)
    }
    walk(top, 0)
    return ok
  }
  const visit = n => {
    if (!n) return
    if (isPerfect(n)) sizesOf.push(count(n))
    visit(n.left)
    visit(n.right)
  }
  visit(treeFromLevelOrder(tree))
  sizesOf.sort((a, b) => b - a)
  return k <= sizesOf.length ? sizesOf[k - 1] : -1
}

test('3319 a complete tree of seven nodes', () => {
  const tree = [1, 2, 3, 4, 5, 6, 7]
  assert.equal(solve({ tree, k: 1 }), 7)
  assert.equal(solve({ tree, k: 2 }), 3)
  assert.equal(solve({ tree, k: 3 }), 3)
  assert.equal(solve({ tree, k: 4 }), 1)
  assert.equal(solve({ tree, k: 8 }), -1)
})

test('3319 a chain has only single-node perfect subtrees', () => {
  assert.equal(solve({ tree: [1, null, 2, null, 3], k: 1 }), 1)
  assert.equal(solve({ tree: [1, null, 2, null, 3], k: 2 }), -1)
})

test('3319 rejects an empty root', () => {
  assert.throws(() => parseInput('{"tree":[null],"k":1}'))
})

test('3319 random trees match a per-subtree oracle', () => {
  let seed = 3319
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const tree = [rnd(9)]
    const extra = 1 + rnd(14)
    for (let i = 1; i < extra; i++) tree.push(rnd(3) ? rnd(9) : null)
    const k = 1 + rnd(5)
    assert.equal(solve({ tree, k }), oracle(tree, k), JSON.stringify({ tree, k }))
  }
})
