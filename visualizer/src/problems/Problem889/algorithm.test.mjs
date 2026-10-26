import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (preorder, postorder) => buildTrace(parseInput(JSON.stringify({ preorder, postorder })))

function trav(t) {
  const pre = [], post = []
  const walk = n => { if (!n) return; pre.push(n.value); walk(n.left); walk(n.right); post.push(n.value) }
  walk(t)
  return { pre, post }
}

test('official example', () => {
  const t = run([1, 2, 4, 5, 3, 6, 7], [4, 5, 2, 6, 7, 3, 1])
  assert.deepEqual(t.result, [1, 2, 3, 4, 5, 6, 7])
  assert.equal(t.frames.at(-1).phase, 'done')
  assert.deepEqual(run([1], [1]).result, [1])
})

test('rebuilt tree reproduces both traversals for random trees', () => {
  let seed = 9
  const rnd = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(14)
    let counter = 0
    const gen = size => {
      if (size === 0) return null
      const node = { value: ++counter, left: null, right: null }
      const l = rnd(size)
      node.left = gen(l)
      node.right = gen(size - 1 - l)
      return node
    }
    const original = gen(n)
    const { pre, post } = trav(original)
    const out = run(pre, post)
    const rebuilt = trav(out.tree)
    assert.deepEqual(rebuilt.pre, pre)
    assert.deepEqual(rebuilt.post, post)
    assert.equal(out.frames.at(-1).phase, 'done')
    assert.equal(out.frames.filter(f => f.phase === 'root').length, n)
  }
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"preorder":[1,2],"postorder":[1,2]}'))
  assert.throws(() => parseInput('{"preorder":[1,2],"postorder":[3,1]}'))
  assert.throws(() => parseInput('{"preorder":[1,1],"postorder":[1,1]}'))
  assert.throws(() => parseInput('{"preorder":[1,2,3],"postorder":[2,3]}'))
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('{"preorder":[1,2,3,4],"postorder":[2,3,4,1]}'))
})
