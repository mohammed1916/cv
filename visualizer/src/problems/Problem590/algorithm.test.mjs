import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('590 official example and edge cases', () => {
  assert.deepEqual(buildTrace([1, null, 3, 2, 4, null, 5, 6]).result, [5, 6, 3, 2, 4, 1])
  assert.deepEqual(buildTrace([1]).result, [1])
  assert.deepEqual(buildTrace([]).result, [])
})

// Independent oracle: plain recursion over the same parsed tree.
function recursivePostorder(node) {
  if (!node) return []
  return [...node.children.flatMap(recursivePostorder), node.value]
}

test('590 iterative postorder equals recursive postorder on random trees', () => {
  let state = 7
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    // Serialize in level order: each node in turn gets a null separator, then its children.
    const items = [rand(100)]
    let made = 1
    for (let q = 0; q < made; q++) {
      items.push(null)
      const kids = Math.min(rand(4), 12 - made)
      for (let k = 0; k < kids; k++) { items.push(rand(100)); made++ }
    }
    const tree = buildTrace(items)
    assert.deepEqual(tree.result, recursivePostorder(tree.root), JSON.stringify(items))
  }
})

test('590 rejects a null root', () => {
  assert.throws(() => parseInput('[null]'))
})
