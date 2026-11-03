import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const run = (root, p, q) => buildTrace(parseInput(JSON.stringify({ root, p, q })))
const leaf = val => ({ val, children: [] })
const node = (val, ...children) => ({ val, children })

// Independent oracle on a parent-edge table: returns { root, edges } after the move.
function oracle(root, p, q) {
  const edges = new Set()
  const parent = new Map()
  const walk = n => n.children.forEach(c => { edges.add(`${n.val}>${c.val}`); parent.set(c.val, n.val); walk(c) })
  walk(root)
  let top = root.val
  if (edges.has(`${q}>${p}`)) return { root: top, edges }
  const inside = (() => { let cur = q; while (cur !== undefined) { if (cur === p) return true; cur = parent.get(cur) } return false })()
  const pParent = parent.get(p)
  if (inside) {
    const qParent = parent.get(q)
    edges.delete(`${qParent}>${q}`)
    if (pParent === undefined) top = q
    else { edges.delete(`${pParent}>${p}`); edges.add(`${pParent}>${q}`) }
    edges.add(`${q}>${p}`)
  } else {
    edges.delete(`${pParent}>${p}`)
    edges.add(`${q}>${p}`)
  }
  return { root: top, edges }
}

const edgesOf = tree => {
  const edges = new Set()
  const walk = n => n.children.forEach(c => { edges.add(`${n.val}>${c.val}`); walk(c) })
  walk(tree)
  return edges
}

test('1516 target lifted before p moves when it sits inside p', () => {
  const root = node(1, node(2, node(3, leaf(4))), leaf(5))
  const { result } = run(root, 2, 3)
  assert.deepEqual(result, node(1, node(3, node(4), node(2)), leaf(5)))
})

test('1516 p moves directly when q is elsewhere', () => {
  const root = node(1, node(2, leaf(4)), leaf(3))
  const { result } = run(root, 4, 3)
  assert.deepEqual(result, node(1, node(2), node(3, leaf(4))))
})

test('1516 root changes when the root is moved below its own descendant', () => {
  const root = node(1, node(2, leaf(3)))
  const { result } = run(root, 1, 3)
  assert.deepEqual(result, node(3, node(1, leaf(2))))
})

test('1516 already a direct child leaves the tree unchanged', () => {
  const root = node(1, leaf(2), leaf(3))
  const { result, frames } = run(root, 2, 1)
  assert.deepEqual(result, root)
  assert.equal(frames.at(-1).phase, 'done')
})

test('1516 rejects bad input', () => {
  assert.throws(() => parseInput(JSON.stringify({ root: node(1, leaf(1)), p: 1, q: 2 })))
  assert.throws(() => parseInput(JSON.stringify({ root: node(1, leaf(2)), p: 2, q: 2 })))
  assert.throws(() => parseInput(JSON.stringify({ root: node(1), p: 1, q: 1 })))
})

function randomTree(rnd, size) {
  const nodes = [leaf(1)]
  for (let v = 2; v <= size; v++) {
    const parent = nodes[rnd(nodes.length)]
    const child = leaf(v)
    parent.children.push(child)
    nodes.push(child)
  }
  return nodes[0]
}

test('1516 random moves match the edge-table oracle and keep every node', () => {
  let seed = 1516
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 2 + rnd(9)
    const root = randomTree(rnd, size)
    let p = 1 + rnd(size)
    let q = 1 + rnd(size)
    if (p === q) q = (q % size) + 1
    const expected = oracle(root, p, q)
    const { result, frames } = run(root, p, q)
    assert.equal(result.val, expected.root, JSON.stringify({ root, p, q }))
    assert.deepEqual(edgesOf(result), expected.edges, JSON.stringify({ root, p, q }))
    const values = []
    const walk = n => { values.push(n.val); n.children.forEach(walk) }
    walk(result)
    assert.deepEqual(values.sort((a, b) => a - b), Array.from({ length: size }, (_, i) => i + 1))
    if (!edgesOf(root).has(`${q}>${p}`)) {
      const qNode = (function find(n) { if (n.val === q) return n; for (const c of n.children) { const h = find(c); if (h) return h } return null })(result)
      assert.equal(qNode.children.at(-1).val, p)
    }
    for (const frame of frames) {
      assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
      assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
      assert.ok(frame.message.length > 0)
    }
  }
})
