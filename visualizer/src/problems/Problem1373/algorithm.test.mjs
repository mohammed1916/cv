import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = tree => buildTrace(parseInput(JSON.stringify({ tree }))).result

test('1373 official examples', () => {
  assert.equal(solve([1, 4, 3, 2, 4, 2, 5, null, null, null, null, null, null, 4, 6]), 20)
  assert.equal(solve([4, 3, null, 1, 2]), 2)
  assert.equal(solve([-4, -2, -5]), 0)
})

test('1373 an all-negative tree answers zero, not a negative sum', () => {
  assert.equal(solve([-3]), 0)
})

test('1373 rejects a value outside the range', () => {
  assert.throws(() => parseInput('{"tree":[41]}'))
})

// Independent oracle: test every subtree by listing its values in order and checking they strictly increase.
function oracle(tree) {
  const root = treeFromLevelOrder(tree)
  const subtrees = []
  const collect = node => { if (!node) return; subtrees.push(node); collect(node.left); collect(node.right) }
  collect(root)
  let best = 0
  for (const top of subtrees) {
    const inorder = []
    const walk = node => { if (!node) return; walk(node.left); inorder.push(node.value); walk(node.right) }
    walk(top)
    const isBst = inorder.every((v, i) => i === 0 || inorder[i - 1] < v)
    if (isBst) best = Math.max(best, inorder.reduce((a, b) => a + b, 0))
  }
  return best
}

test('1373 random trees match a subtree-by-subtree oracle', () => {
  let seed = 1373
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const tree = [rnd(81) - 40]
    const extra = rnd(13)
    for (let i = 0; i < extra; i++) tree.push(rnd(4) ? rnd(81) - 40 : null)
    assert.equal(solve(tree), oracle(tree), JSON.stringify(tree))
  }
})
