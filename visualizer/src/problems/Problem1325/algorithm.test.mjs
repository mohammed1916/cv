import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: nested objects, then repeated full passes that drop every leaf equal to the target until nothing changes.
function nest(arr) {
  const make = value => ({ value, left: null, right: null })
  const root = make(arr[0])
  const queue = [root]
  let cursor = 1
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    if (cursor < arr.length && arr[cursor] !== null) { node.left = make(arr[cursor]); queue.push(node.left) }
    cursor++
    if (cursor < arr.length && arr[cursor] !== null) { node.right = make(arr[cursor]); queue.push(node.right) }
    cursor++
  }
  return root
}

function oracle({ root, target }) {
  let tree = nest(root)
  const dropLeaves = node => {
    if (!node) return null
    const left = dropLeaves(node.left)
    const right = dropLeaves(node.right)
    if (!left && !right && node.value === target) return null
    return { value: node.value, left, right }
  }
  let before
  do {
    before = JSON.stringify(tree)
    tree = dropLeaves(tree)
  } while (tree && JSON.stringify(tree) !== before)
  // Serialize the result the same way the problem's output is written.
  const out = []
  const queue = [tree]
  for (let i = 0; i < queue.length; i++) {
    if (!queue[i]) { out.push(null); continue }
    out.push(queue[i].value)
    queue.push(queue[i].left, queue[i].right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

test('1325 official examples', () => {
  assert.deepEqual(solve({ root: [1, 2, 3, 2, null, 2, 4], target: 2 }), [1, null, 3, null, 4])
  assert.deepEqual(solve({ root: [1, 3, 3, 3, 2], target: 3 }), [1, 3, null, null, 2])
  assert.deepEqual(solve({ root: [1, 2, null, 2, null, 2], target: 2 }), [1])
})

test('1325 the whole tree can disappear', () => {
  assert.deepEqual(solve({ root: [1, 1, 1], target: 1 }), [])
  assert.deepEqual(solve({ root: [2], target: 1 }), [2])
})

test('1325 rejects bad input', () => {
  assert.throws(() => parseInput('{"root":[],"target":1}'))
  assert.throws(() => parseInput('{"root":[5],"target":1}'))
  assert.throws(() => parseInput('{"root":[null,1],"target":1}'))
})

test('1325 random trees match a repeated-pass oracle', () => {
  let seed = 1325
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const root = [1 + rnd(3)]
    const extra = rnd(12)
    for (let i = 0; i < extra; i++) root.push(rnd(4) === 0 ? null : 1 + rnd(3))
    const target = 1 + rnd(3)
    assert.deepEqual(solve({ root, target }), oracle({ root, target }), JSON.stringify({ root, target }))
  }
})
