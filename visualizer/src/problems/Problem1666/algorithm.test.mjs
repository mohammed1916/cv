import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const run = (root, leaf) => buildTrace(parseInput(JSON.stringify({ root, leaf })))

// Independent oracle: the same undirected edges, rooted at the leaf by breadth-first search.
function oracle(root, leaf) {
  const edges = []
  const slots = root
  const kids = new Map()
  let i = 1
  const queue = [slots[0]]
  for (let q = 0; q < queue.length; q++) {
    const v = queue[q]
    kids.set(v, [])
    for (let k = 0; k < 2; k++, i++) if (i < slots.length && slots[i] !== null) { kids.get(v).push(slots[i]); edges.push([v, slots[i]]); queue.push(slots[i]) }
  }
  const adj = new Map([...kids.keys()].map(v => [v, []]))
  for (const [a, b] of edges) { adj.get(a).push(b); adj.get(b).push(a) }
  const parent = new Map([[leaf, null]])
  const bfs = [leaf]
  for (let q = 0; q < bfs.length; q++) for (const n of adj.get(bfs[q])) if (!parent.has(n)) { parent.set(n, bfs[q]); bfs.push(n) }
  const children = new Map(bfs.map(v => [v, bfs.filter(c => parent.get(c) === v)]))
  return { parent, children, edgeCount: edges.length }
}

function check(root, leaf) {
  const r = run(root, leaf)
  const last = r.frames[r.frames.length - 1].links
  const byVal = new Map(last.map(n => [n.val, n]))
  const exp = oracle(root, leaf)
  assert.equal(r.result, leaf)
  for (const n of last) {
    const kids = [n.left, n.right].filter(v => v !== null).sort((a, b) => a - b)
    assert.deepEqual(kids, (exp.children.get(n.val) || []).slice().sort((a, b) => a - b), `children of ${n.val}`)
    assert.equal(n.parent, exp.parent.get(n.val), `parent of ${n.val}`)
  }
  assert.equal(byVal.get(leaf).parent, null)
  return r
}

test('1666 the authored presets reroot to their leaf', () => {
  check([10, 6, 14, 3, 8, null, 20, 1, null, null, 9], 1)
  check([4, 2, 7, 1, 3, 6, 9], 6)
  check([8, 3, 12, null, 5, null, null, 4], 4)
})

test('1666 the leaf becomes the left child of its old parent and off-path children move right', () => {
  const r = check([4, 2, 7, 1, 3, 6, 9], 6)
  const last = new Map(r.frames[r.frames.length - 1].links.map(n => [n.val, n]))
  assert.equal(last.get(7).left, 4)
  assert.equal(last.get(7).right, 9)
  assert.equal(last.get(4).left, null)
  assert.equal(last.get(4).right, 2)
})

test('1666 a single-node tree stays as it is', () => {
  assert.equal(run([5], 5).result, 5)
})

test('1666 rejects malformed input', () => {
  assert.throws(() => parseInput('{"root":[1,2,3],"leaf":1}'))
  assert.throws(() => parseInput('{"root":[1,2,3],"leaf":9}'))
  assert.throws(() => parseInput('{"root":[1,2,2],"leaf":2}'))
  assert.throws(() => parseInput('{"root":[1,2,3,4],"leaf":2}'))
})

test('1666 random trees reroot consistently with the breadth-first oracle', () => {
  let seed = 1666
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(12)
    const nodes = [{ val: 1, left: null, right: null }]
    for (let v = 2; v <= size; v++) {
      const open = nodes.filter(n => n.left === null || n.right === null)
      const host = open[rnd(open.length)]
      const child = { val: v, left: null, right: null }
      if (host.left === null && (host.right !== null || rnd(2) === 0)) host.left = child
      else host.right = child
      nodes.push(child)
    }
    const slots = [1]
    const queue = [nodes[0]]
    for (let q = 0; q < queue.length; q++) {
      const n = queue[q]
      for (const side of ['left', 'right']) {
        if (n[side]) { slots.push(n[side].val); queue.push(n[side]) } else slots.push(null)
      }
    }
    while (slots[slots.length - 1] === null) slots.pop()
    const leaves = nodes.filter(n => n.left === null && n.right === null).map(n => n.val)
    const leaf = leaves[rnd(leaves.length)]
    check(slots, leaf)
  }
})
