import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, buildTree, parseInput } from './algorithm.js'

const solve = tree => buildTrace({ tree }).result

// Oracle: give every node a left/right path string; left-to-right order inside a level is string order.
function oracle(tree) {
  const { root } = buildTree(tree)
  const byDepth = []
  const visit = (node, path) => {
    if (!node) return
    const d = path.length
    if (!byDepth[d]) byDepth[d] = []
    byDepth[d].push({ node, path })
    visit(node.left, path + 'L')
    visit(node.right, path + 'R')
  }
  visit(root, '')
  return byDepth.map((entries, d) => {
    const ordered = entries.sort((a, b) => (a.path < b.path ? -1 : 1)).map(e => e.node)
    const oddLevel = (d + 1) % 2 === 1
    const seq = oddLevel ? ordered : ordered.slice().reverse()
    let total = 0
    for (const node of seq) {
      const side = oddLevel ? node.left : node.right
      if (!side) break
      total += node.val
    }
    return total
  })
}

test('3902 hand-checked presets', () => {
  assert.deepEqual(solve([1, 2, 3, 4, null, null, 5]), [1, 3, 0])
  assert.deepEqual(solve([6, 3, 9, 2, 4, null, 8, 1, null, null, 7]), [6, 12, 2, 0])
})

test('3902 a single root has no left child so level one sums to zero', () => {
  assert.deepEqual(solve([5]), [0])
})

test('3902 a full level with children reads every node', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5, 6, 7]), [1, 5, 0])
})

test('3902 frames carry the level sums', () => {
  const run = buildTrace({ tree: [6, 3, 9, 2, 4, null, 8, 1, null, null, 7] })
  assert.deepEqual(run.frames.at(-1).sums, run.result)
})

test('3902 parser rejects an empty root', () => {
  assert.throws(() => parseInput('{"tree":[null]}'))
})

test('3902 matches the path-string oracle on random trees', () => {
  let seed = 3902
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const size = 1 + rnd(10)
    const tree = [rnd(19) - 9]
    const queue = [0]
    let count = 1
    for (let q = 0; q < queue.length && count < size; q += 1) {
      for (let s = 0; s < 2 && count < size; s += 1) {
        if (rnd(3) === 0) tree.push(null)
        else { tree.push(rnd(19) - 9); queue.push(tree.length - 1); count += 1 }
      }
    }
    while (tree.at(-1) === null) tree.pop()
    assert.deepEqual(solve(tree), oracle(tree), JSON.stringify(tree))
  }
})
