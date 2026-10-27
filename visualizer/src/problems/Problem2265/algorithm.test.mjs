import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = tree => buildTrace(parseInput(JSON.stringify({ tree }))).result

test('2265 official examples', () => {
  assert.equal(solve([4, 8, 5, 0, 1, null, 6]), 5)
  assert.equal(solve([1]), 1)
})

test('2265 the average is rounded down before comparing', () => {
  // Subtree of 2 with child 3: floor(5 / 2) = 2, so the root 2 matches; the leaf 3 matches itself.
  assert.equal(solve([2, 3]), 2)
})

test('2265 rejects a negative value', () => {
  assert.throws(() => parseInput('{"tree":[-1]}'))
})

// Independent oracle: for each node, gather every value below it in a plain array and average that array.
function oracle(tree) {
  const root = treeFromLevelOrder(tree)
  const nodes = []
  const collect = node => { if (!node) return; nodes.push(node); collect(node.left); collect(node.right) }
  collect(root)
  const values = node => (node ? [node.value, ...values(node.left), ...values(node.right)] : [])
  return nodes.filter(node => {
    const list = values(node)
    return Math.floor(list.reduce((a, b) => a + b, 0) / list.length) === node.value
  }).length
}

test('2265 random trees match a gather-and-average oracle', () => {
  let seed = 2265
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const tree = [rnd(21)]
    const extra = rnd(14)
    for (let i = 0; i < extra; i++) tree.push(rnd(4) ? rnd(21) : null)
    assert.equal(solve(tree), oracle(tree), JSON.stringify(tree))
  }
})
