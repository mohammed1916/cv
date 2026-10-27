import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { serialize } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1080 statement example', () => {
  assert.deepEqual(solve({ root: [1, 2, -3, -5, null, 4, null], limit: -1 }), [1, null, -3, 4])
})

test('1080 a tree with every path below the limit is removed', () => {
  assert.deepEqual(solve({ root: [1, 2, 3], limit: 100 }), [])
})

test('1080 rejects a limit outside the range', () => {
  assert.throws(() => parseInput('{"root":[1],"limit":5000}'))
})

// Independent oracle: enumerate all root-to-leaf paths, keep every node on a sufficient path, and serialize what remains.
function oracle({ root, limit }) {
  const tree = treeFromLevelOrder(root)
  const keep = new Set()
  const walk = (node, path, sum) => {
    if (!node) return
    const here = [...path, node]
    const total = sum + node.value
    if (!node.left && !node.right) {
      if (total >= limit) for (const n of here) keep.add(n.id)
      return
    }
    walk(node.left, here, total)
    walk(node.right, here, total)
  }
  walk(tree, [], 0)
  const copy = node => {
    if (!node || !keep.has(node.id)) return null
    return { id: node.id, value: node.value, left: copy(node.left), right: copy(node.right) }
  }
  return serialize(copy(tree))
}

test('1080 random trees match a sufficient-path oracle', () => {
  let seed = 1080
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const root = [rnd(41) - 20]
    for (let i = 1; i < 1 + rnd(14); i++) root.push(rnd(4) === 0 ? null : rnd(41) - 20)
    const input = { root, limit: rnd(41) - 20 }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
