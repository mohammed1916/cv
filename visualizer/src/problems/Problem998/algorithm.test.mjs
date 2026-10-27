import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = (arr, val) => buildTrace({ arr, val }).result

test('998 official examples', () => {
  assert.deepEqual(solve([4, 1, 3, null, null, 2], 5), [5, 4, null, 1, 3, null, null, 2])
  assert.deepEqual(solve([5, 2, 4, null, 1], 3), [5, 2, 4, null, 1, null, 3])
  assert.deepEqual(solve([5, 2, 3, null, 1], 4), [5, 2, 4, null, 1, 3])
})

test('998 a single root, and a value smaller than every node', () => {
  assert.deepEqual(solve([1], 2), [2, 1])
  assert.deepEqual(solve([5], 3), [5, null, 3])
})

test('998 rejects an arr that is not a maximum tree or a duplicate val', () => {
  assert.throws(() => parseInput('{"arr":[1,2],"val":3}'), /maximum tree/)
  assert.throws(() => parseInput('{"arr":[5,null,3,null,null,1],"val":4}'), /missing parent/)
  assert.throws(() => parseInput('{"arr":[5,3],"val":3}'), /val must be/)
})

// Build a maximum tree from a sequence: the largest element is the root, and each side is built recursively.
function buildMax(seq, lo = 0, hi = seq.length) {
  if (lo >= hi) return null
  let best = lo
  for (let i = lo + 1; i < hi; i++) if (seq[i] > seq[best]) best = i
  return { value: seq[best], left: buildMax(seq, lo, best), right: buildMax(seq, best + 1, hi) }
}

// Serialize by depth: each level lists its nodes left to right, with a null only under a real parent.
// This is a different walk from the BFS in algorithm.js, so the two can disagree if either is wrong.
function serialize(root) {
  const levels = []
  const visit = (node, depth) => {
    while (levels.length <= depth) levels.push([])
    if (!node) {
      levels[depth].push(null)
      return
    }
    levels[depth].push(node.value)
    visit(node.left, depth + 1)
    visit(node.right, depth + 1)
  }
  visit(root, 0)
  const out = levels.flat()
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

// Independent oracle: read A back as the in-order walk of the input tree, append val, and rebuild from scratch.
function oracle(arr, val) {
  const inorder = []
  const walk = node => {
    if (!node) return
    walk(node.left)
    inorder.push(node.value)
    walk(node.right)
  }
  walk(treeFromLevelOrder(arr))
  return serialize(buildMax([...inorder, val]))
}

test('998 random maximum trees match a rebuild-from-scratch oracle', () => {
  let seed = 998
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400; t++) {
    const size = 1 + rnd(8)
    const pool = Array.from({ length: 100 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const arr = serialize(buildMax(pool.slice(0, size)))
    if (arr.length > 12) continue
    // pool[size..] are the values not in arr, so val is always fresh.
    const val = pool[size + rnd(100 - size)]
    parseInput(JSON.stringify({ arr, val }))
    assert.deepEqual(solve(arr, val), oracle(arr, val), JSON.stringify({ arr, val }))
    checked++
  }
  assert.ok(checked > 100, `only ${checked} trees fit the size cap`)
})
