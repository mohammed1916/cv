import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (root, p, q) => buildTrace({ root, p, q }).result
const codeLines = code.length
const pyLines = python.split('\n').length

// Oracle: breadth-first search over the undirected tree graph.
function oracle(values, p, q) {
  const adj = new Map()
  const link = (a, b) => { if (!adj.has(a)) adj.set(a, []); if (!adj.has(b)) adj.set(b, []); adj.get(a).push(b); adj.get(b).push(a) }
  values.forEach((v, i) => {
    if (v === null || i === 0) return
    const parent = Math.floor((i - 1) / 2)
    if (values[parent] !== null) link(values[parent], v)
  })
  const dist = new Map([[p, 0]])
  const queue = [p]
  while (queue.length) {
    const cur = queue.shift()
    for (const nxt of adj.get(cur) || []) if (!dist.has(nxt)) { dist.set(nxt, dist.get(cur) + 1); queue.push(nxt) }
  }
  return dist.get(q)
}

test('1740 worked examples', () => {
  const root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]
  assert.equal(solve(root, 5, 1), 2)
  assert.equal(solve(root, 7, 4), 2)
  assert.equal(solve(root, 7, 1), 4)
  assert.equal(solve(root, 6, 6), 0)
  assert.equal(solve(root, 5, 4), 2)
})

test('1740 rejects a value outside the tree', () => {
  assert.throws(() => parseInput('{"root":[1,2,3],"p":9,"q":1}'))
})

test('1740 frames point at real pseudocode and python lines', () => {
  const run = buildTrace({ root: [3, 5, 1, 6, 2, 0, 8], p: 6, q: 8 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1740 random trees match a BFS distance oracle', () => {
  let seed = 1740
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 2 + rnd(11)
    const pool = Array.from({ length: 20 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const arrLen = 2 ** Math.ceil(Math.log2(size + 1)) - 1
    const values = []
    let filled = 0
    for (let i = 0; i < arrLen; i++) {
      const parentOk = i === 0 || values[Math.floor((i - 1) / 2)] !== null
      if (filled < size && parentOk && rnd(3) > 0) { values.push(pool[filled]); filled++ } else values.push(null)
    }
    if (values[0] === null) continue
    while (values.length && values[values.length - 1] === null) values.pop()
    const present = values.filter(v => v !== null)
    const p = present[rnd(present.length)]
    const q = present[rnd(present.length)]
    assert.equal(solve(values, p, q), oracle(values, p, q), JSON.stringify({ values, p, q }))
  }
})
