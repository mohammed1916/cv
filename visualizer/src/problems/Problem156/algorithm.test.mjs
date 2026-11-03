import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = values => buildTrace({ values: parseInput(JSON.stringify({ values })).values }).result

test('156 sample trees turn into the expected level-order lists', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5]), [4, 5, 2, null, null, 3, 1])
  assert.deepEqual(solve([1]), [1])
  assert.deepEqual(solve([10, 20, 30, 40, null, 50, null]), [40, null, 20, 30, 10, 50])
})

test('156 rejects invalid trees', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"values":[1,null,2]}'), /left sibling/)
  assert.throws(() => parseInput('{"values":[1,2,2]}'), /unique/)
  assert.throws(() => parseInput('{"values":[null]}'), /root/)
})

// Oracle: the classic recursive rewiring, applied to independently generated trees.
function serialize(root) {
  if (!root) return []
  const out = []
  const queue = [root]
  for (let h = 0; h < queue.length; h++) {
    const n = queue[h]
    if (!n) { out.push(null); continue }
    out.push(n.val)
    queue.push(n.left, n.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

function reference(root) {
  if (!root || !root.left) return root
  const newRoot = reference(root.left)
  root.left.left = root.right
  root.left.right = root
  root.left = null
  root.right = null
  return newRoot
}

test('156 random valid trees match the recursive rewiring', () => {
  let seed = 17
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    let next = 1
    const budget = { left: 1 + rnd(14) }
    const grow = () => {
      if (budget.left <= 0 || rnd(4) === 0) return null
      budget.left -= 1
      const node = { val: next++, left: null, right: null }
      node.left = grow()
      if (node.left) node.right = grow()
      return node
    }
    const tree = grow()
    if (!tree) continue
    // Serialise the same tree level by level, with null for missing children.
    const values = []
    const queue = [tree]
    for (let h = 0; h < queue.length; h++) {
      const n = queue[h]
      if (!n) { values.push(null); continue }
      values.push(n.val)
      queue.push(n.left, n.right)
    }
    while (values.length && values[values.length - 1] === null) values.pop()
    const input = JSON.stringify({ values })
    parseInput(input)
    const expected = serialize(reference(tree))
    assert.deepEqual(solve(JSON.parse(input).values), expected, input)
  }
})
