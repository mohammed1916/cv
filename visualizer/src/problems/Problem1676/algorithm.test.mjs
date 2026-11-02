import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (root, nodes) => buildTrace({ root, nodes }).result
const codeLines = code.length
const pyLines = python.split('\n').length

function ancestorsOf(values, target) {
  const out = []
  let i = values.indexOf(target)
  while (i >= 0) { out.push(values[i]); i = i === 0 ? -1 : Math.floor((i - 1) / 2) }
  return out
}

function oracle(values, nodes) {
  const sets = nodes.map(v => new Set(ancestorsOf(values, v)))
  const common = ancestorsOf(values, nodes[0]).filter(v => sets.every(s => s.has(v)))
  return common[0]
}

test('1676 worked examples', () => {
  const root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]
  assert.equal(solve(root, [4, 7]), 2)
  assert.equal(solve(root, [5, 4]), 5)
  assert.equal(solve(root, [6, 0, 8]), 3)
  assert.equal(solve(root, [1]), 1)
})

test('1676 rejects a node that is not in the tree', () => {
  assert.throws(() => parseInput('{"root":[1,2,3],"nodes":[9]}'))
  assert.throws(() => parseInput('{"root":[1,2,3],"nodes":[2,2]}'))
})

test('1676 frames point at real pseudocode and python lines', () => {
  const run = buildTrace({ root: [3, 5, 1, 6, 2, 0, 8], nodes: [6, 2] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1676 random trees match a common-ancestor oracle', () => {
  let seed = 1676
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(12)
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
    const k = 1 + rnd(Math.min(4, present.length))
    const nodes = []
    while (nodes.length < k) { const v = present[rnd(present.length)]; if (!nodes.includes(v)) nodes.push(v) }
    assert.equal(solve(values, nodes), oracle(values, nodes), JSON.stringify({ values, nodes }))
  }
})
