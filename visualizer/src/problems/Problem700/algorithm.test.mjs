import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('700 official examples', () => {
  assert.deepEqual(buildTrace({ root: [4, 2, 7, 1, 3], val: 2 }).result, [2, 1, 3])
  assert.equal(buildTrace({ root: [4, 2, 7, 1, 3], val: 5 }).result, null)
})

// Oracle: linear scan of every node with a depth-first walk, returning the first subtree whose root matches.
test('700 random BSTs match a depth-first search oracle', () => {
  let state = 73
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rand(10) }, () => rand(20))
    const insert = (node, v) => { if (!node) return { v, l: null, r: null }; if (v < node.v) node.l = insert(node.l, v); else node.r = insert(node.r, v); return node }
    let root = null
    for (const v of values) root = insert(root, v)
    const level = [], queue = [root]
    for (let q = 0; q < queue.length; q++) { const n = queue[q]; if (n) { level.push(n.v); queue.push(n.l, n.r) } else level.push(null) }
    while (level.at(-1) === null) level.pop()
    const val = rand(22) - 1
    const find = n => { if (!n) return null; if (n.v === val) return n; return find(n.l) ?? find(n.r) }
    const hit = find(root)
    const serialize = n => { if (!n) return []; const out = [], q2 = [n]; for (let i = 0; i < q2.length; i++) { const x = q2[i]; if (x) { out.push(x.v); q2.push(x.l, x.r) } else out.push(null) } while (out.at(-1) === null) out.pop(); return out }
    assert.deepEqual(buildTrace({ root: level, val }).result, hit ? serialize(hit) : null, JSON.stringify({ level, val }))
  }
})

test('700 rejects a null root', () => {
  assert.throws(() => parseInput('{"root":[null],"val":1}'))
})
