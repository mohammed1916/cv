import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: convert the level-order array to a postfix token list by an explicit post-order walk, then evaluate it with a stack.
function oracle(root) {
  const make = value => ({ value, left: null, right: null })
  const top = make(root[0])
  const queue = [top]
  let cursor = 1
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    if (cursor < root.length && root[cursor] !== null) { node.left = make(root[cursor]); queue.push(node.left) }
    cursor++
    if (cursor < root.length && root[cursor] !== null) { node.right = make(root[cursor]); queue.push(node.right) }
    cursor++
  }
  const tokens = []
  const stack = [[top, false]]
  while (stack.length) {
    const [node, done] = stack.pop()
    if (done) { tokens.push(node.value); continue }
    stack.push([node, true])
    if (node.right) stack.push([node.right, false])
    if (node.left) stack.push([node.left, false])
  }
  const values = []
  for (const t of tokens) {
    if (t === 0 || t === 1) values.push(t === 1)
    else {
      const b = values.pop()
      const a = values.pop()
      values.push(t === 2 ? a || b : a && b)
    }
  }
  return values[0]
}

test('2331 official examples', () => {
  assert.equal(solve({ root: [2, 1, 3, null, null, 0, 1] }), true)
  assert.equal(solve({ root: [0] }), false)
})

test('2331 a single true leaf and an AND of two leaves', () => {
  assert.equal(solve({ root: [1] }), true)
  assert.equal(solve({ root: [3, 1, 0] }), false)
  assert.equal(solve({ root: [2, 0, 1] }), true)
})

test('2331 rejects bad input', () => {
  assert.throws(() => parseInput('{"root":[4]}'))
  assert.throws(() => parseInput('{"root":[2,1]}'))
  assert.throws(() => parseInput('{"root":[2,2,1]}'))
  assert.throws(() => parseInput('{"root":[]}'))
})

// Build random full binary trees (every internal node has two children), serialize them level by level, and compare.
test('2331 random full trees match a postfix oracle', () => {
  let seed = 2331
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const grow = depth => {
    if (depth === 0 || rnd(3) === 0) return { v: rnd(2) }
    return { v: 2 + rnd(2), l: grow(depth - 1), r: grow(depth - 1) }
  }
  const serialize = top => {
    const out = []
    const queue = [top]
    for (let i = 0; i < queue.length; i++) {
      const n = queue[i]
      if (!n) { out.push(null); continue }
      out.push(n.v)
      queue.push(n.l || null, n.r || null)
    }
    while (out.length && out[out.length - 1] === null) out.pop()
    return out
  }
  for (let t = 0; t < 300; t++) {
    const root = serialize(grow(1 + rnd(3)))
    if (root.length > 15) continue
    assert.equal(solve({ root }), oracle(root), JSON.stringify(root))
  }
})
