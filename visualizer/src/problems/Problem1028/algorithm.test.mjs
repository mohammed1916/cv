import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = traversal => buildTrace(parseInput(JSON.stringify({ traversal }))).result

test('1028 official examples', () => {
  assert.deepEqual(solve('1-2--3--4-5--6--7'), [1, 2, 5, 3, 4, 6, 7])
  assert.deepEqual(solve('1-2--3---4-5--6---7'), [1, 2, 5, 3, null, 6, null, 4, null, 7])
  assert.deepEqual(solve('1-401--349---90--88'), [1, 401, null, 349, 88, 90])
})

test('1028 a single value is the whole tree', () => {
  assert.deepEqual(solve('7'), [7])
})

test('1028 rejects a depth that jumps past the parent and a bad format', () => {
  assert.throws(() => parseInput('{"traversal":"1---2"}'))
  assert.throws(() => parseInput('{"traversal":"-1-2"}'))
  assert.throws(() => parseInput('{"traversal":"1-02"}'))
})

// Independent oracle: the generator knows the tree it wrote, so the expected answer is that tree in level order.
function expectedLevelOrder(root) {
  const out = []
  const queue = [root]
  while (queue.length) {
    const n = queue.shift()
    if (n === null) { out.push(null); continue }
    out.push(n.value)
    queue.push(n.left, n.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

test('1028 random trees round-trip through their dashed preorder string', () => {
  let seed = 1028
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let count = 0
    // A right child is written only after a left child, because the format cannot express a right-only node.
    const make = () => {
      count++
      const node = { value: rnd(10), left: null, right: null }
      if (count < 12 && rnd(3) > 0) {
        node.left = make()
        if (count < 12 && rnd(2) === 0) node.right = make()
      }
      return node
    }
    const root = make()
    const parts = []
    const walk = (node, depth) => {
      parts.push('-'.repeat(depth) + node.value)
      if (node.left) walk(node.left, depth + 1)
      if (node.right) walk(node.right, depth + 1)
    }
    walk(root, 0)
    const traversal = parts.join('')
    assert.deepEqual(solve(traversal), expectedLevelOrder(root), traversal)
  }
})
