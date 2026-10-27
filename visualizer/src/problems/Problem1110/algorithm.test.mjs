import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: nested objects, a parent map, and a breadth-first search for each surviving root; results are compared sorted.
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

function toArray(top) {
  const out = []
  const queue = [top]
  for (let i = 0; i < queue.length; i++) {
    if (!queue[i]) { out.push(null); continue }
    out.push(queue[i].value)
    queue.push(queue[i].left, queue[i].right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

function oracle({ root, to_delete }) {
  const top = nest(root)
  const parent = new Map([[top, null]])
  const all = []
  const bfs = [top]
  for (let i = 0; i < bfs.length; i++) {
    const n = bfs[i]
    all.push(n)
    for (const c of [n.left, n.right]) if (c) { parent.set(c, n); bfs.push(c) }
  }
  const gone = new Set(to_delete)
  const roots = all.filter(n => !gone.has(n.value) && (parent.get(n) === null || gone.has(parent.get(n).value)))
  // Rebuild each surviving tree, dropping deleted nodes.
  const prune = n => {
    if (!n || gone.has(n.value)) return null
    return { value: n.value, left: prune(n.left), right: prune(n.right) }
  }
  return roots.map(r => toArray(prune(r))).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
}

const sorted = list => [...list].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))

test('1110 official examples', () => {
  assert.deepEqual(solve({ root: [1, 2, 3, 4, 5, 6, 7], to_delete: [3, 5] }), [[1, 2, null, 4], [6], [7]])
  assert.deepEqual(solve({ root: [1, 2, 4, null, 3], to_delete: [3] }), [[1, 2, 4]])
})

test('1110 deleting the root and deleting nothing', () => {
  assert.deepEqual(solve({ root: [1, 2, 3], to_delete: [1] }), [[2], [3]])
  assert.deepEqual(solve({ root: [1, 2, 3], to_delete: [] }), [[1, 2, 3]])
})

test('1110 rejects bad input', () => {
  assert.throws(() => parseInput('{"root":[1,1],"to_delete":[]}'))
  assert.throws(() => parseInput('{"root":[1],"to_delete":[1,1]}'))
  assert.throws(() => parseInput('{"root":[1],"to_delete":[16]}'))
})

test('1110 random trees match a parent-map oracle', () => {
  let seed = 1110
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pool = Array.from({ length: 10 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const root = [pool[0]]
    for (let i = 1; i < 1 + rnd(10); i++) root.push(rnd(3) === 0 ? null : pool[i])
    const to_delete = pool.slice(10 - rnd(4), 10).filter(() => rnd(2) === 0).slice(0, 4)
    const input = { root, to_delete }
    assert.deepEqual(sorted(solve(input)), oracle(input), JSON.stringify(input))
  }
})
