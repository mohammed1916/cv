import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

function postorderOf(node, out = []) {
  if (!node) return out
  postorderOf(node.left, out)
  postorderOf(node.right, out)
  out.push(node.value)
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
  // Tree: 5 has left 3 (children 1 and 4) and right 8 (children 7 and 9).
  const run = buildTrace({ inorder: [1, 3, 4, 5, 7, 8, 9], postorder: [1, 4, 3, 7, 9, 8, 5] })
  assert.equal(run.result.value, 5)
  assert.equal(run.result.left.value, 3)
  assert.equal(run.result.right.value, 8)
  assert.deepEqual(postorderOf(run.result), [1, 4, 3, 7, 9, 8, 5])
  assert.deepEqual(inorderOf(run.result), [1, 3, 4, 5, 7, 8, 9])
})

test('single node and right chain', () => {
  assert.equal(buildTrace({ inorder: [7], postorder: [7] }).result.right, null)
  const right = buildTrace({ inorder: [1, 2, 3, 4], postorder: [4, 3, 2, 1] }).result
  assert.equal(right.value, 1)
  assert.equal(right.left, null)
  assert.deepEqual(postorderOf(right), [4, 3, 2, 1])
})

test('random trees reproduce their traversals', () => {
  let state = 23
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(12)
    const values = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = n - 1; i > 0; i--) { const j = rand(i + 1); [values[i], values[j]] = [values[j], values[i]] }
    const make = list => {
      if (!list.length) return null
      const [head, ...rest] = list
      const cut = rand(rest.length + 1)
      return { value: head, left: make(rest.slice(0, cut)), right: make(rest.slice(cut)) }
    }
    const tree = make(values)
    const post = postorderOf(tree), ino = inorderOf(tree)
    const rebuilt = buildTrace({ inorder: ino, postorder: post }).result
    assert.deepEqual(postorderOf(rebuilt), post)
    assert.deepEqual(inorderOf(rebuilt), ino)
  }
})

test('inconsistent traversals are rejected during the trace', () => {
  assert.throws(() => buildTrace({ inorder: [2, 1, 3], postorder: [3, 2, 1] }), /disagree/)
})

test('parser rejects malformed input', () => {
  assert.throws(() => parseInput('{"inorder":[1,2],"postorder":[1]}'), /same length/)
  assert.throws(() => parseInput('{"inorder":[1,1],"postorder":[1,1]}'), /distinct/)
  assert.throws(() => parseInput('{"inorder":[1,2],"postorder":[1,3]}'), /same values/)
  assert.throws(() => parseInput('{"inorder":[],"postorder":[]}'), /1 to 20/)
})

test('every frame names a phase, a code line and a message; the last frame is done', () => {
  const run = buildTrace({ inorder: [1, 3, 4, 5, 7, 8, 9], postorder: [1, 4, 3, 7, 9, 8, 5] })
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
