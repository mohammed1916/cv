import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

function preorderOf(node, out = []) {
  if (!node) return out
  out.push(node.value)
  preorderOf(node.left, out)
  preorderOf(node.right, out)
  return out
}
function inorderOf(node, out = []) {
  if (!node) return out
  inorderOf(node.left, out)
  out.push(node.value)
  inorderOf(node.right, out)
  return out
}

test('a mixed tree is rebuilt exactly', () => {
  const run = buildTrace({ preorder: [5, 3, 1, 4, 8, 7, 9], inorder: [1, 3, 4, 5, 7, 8, 9] })
  assert.equal(run.result.value, 5)
  assert.equal(run.result.left.value, 3)
  assert.equal(run.result.right.value, 8)
  assert.deepEqual(preorderOf(run.result), [5, 3, 1, 4, 8, 7, 9])
  assert.deepEqual(inorderOf(run.result), [1, 3, 4, 5, 7, 8, 9])
})

test('single node, left chain and right chain', () => {
  assert.equal(buildTrace({ preorder: [7], inorder: [7] }).result.left, null)
  const left = buildTrace({ preorder: [4, 3, 2, 1], inorder: [1, 2, 3, 4] }).result
  assert.deepEqual(preorderOf(left), [4, 3, 2, 1])
  assert.equal(left.right, null)
  const right = buildTrace({ preorder: [1, 2, 3], inorder: [1, 2, 3] }).result
  assert.equal(right.left, null)
  assert.deepEqual(inorderOf(right), [1, 2, 3])
})

// Random binary trees: traversals of a generated tree must rebuild a tree with the same traversals.
test('random trees reproduce their traversals', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(12)
    const values = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = n - 1; i > 0; i--) { const j = rand(i + 1); [values[i], values[j]] = [values[j], values[i]] }
    // Build a random tree by a recursive split of the shuffled values.
    const make = list => {
      if (!list.length) return null
      const [head, ...rest] = list
      const cut = rand(rest.length + 1)
      return { value: head, left: make(rest.slice(0, cut)), right: make(rest.slice(cut)) }
    }
    const tree = make(values)
    const pre = preorderOf(tree), ino = inorderOf(tree)
    const rebuilt = buildTrace({ preorder: pre, inorder: ino }).result
    assert.deepEqual(preorderOf(rebuilt), pre)
    assert.deepEqual(inorderOf(rebuilt), ino)
  }
})

test('inconsistent traversals are rejected during the trace', () => {
  assert.throws(() => buildTrace({ preorder: [1, 3, 2], inorder: [2, 1, 3] }), /disagree/)
})

test('parser rejects malformed input', () => {
  assert.throws(() => parseInput('{"preorder":[1,2],"inorder":[1]}'), /same length/)
  assert.throws(() => parseInput('{"preorder":[1,1],"inorder":[1,1]}'), /distinct/)
  assert.throws(() => parseInput('{"preorder":[1,2],"inorder":[1,3]}'), /same values/)
  assert.throws(() => parseInput('{"preorder":[],"inorder":[]}'), /1 to 20/)
})

test('every frame names a phase, a code line and a message; the last frame is done', () => {
  const run = buildTrace({ preorder: [5, 3, 1, 4, 8, 7, 9], inorder: [1, 3, 4, 5, 7, 8, 9] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(code.length, python.split('\n').length)
})
