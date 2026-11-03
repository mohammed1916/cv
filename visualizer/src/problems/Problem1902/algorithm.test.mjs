import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = values => buildTrace(values).result

test('1902 worked examples', () => {
  assert.equal(solve([4, 2, 6, 1, 3, 5, 7]), 3)
  assert.equal(solve([1, 3, 2]), 3)
  assert.equal(solve([5, 4, 3, 2, 1]), 5)
})

test('1902 edge cases: one value and a single branch', () => {
  assert.equal(solve([9]), 1)
  assert.equal(solve([2, 1]), 2)
  assert.equal(solve([2, 3, 4, 5, 6]), 5)
})

test('1902 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1,1]'))
  assert.throws(() => parseInput('{"a":1}'))
  assert.throws(() => parseInput('[100]'))
})

// Independent oracle: build nested objects recursively and measure the height.
function oracle(values) {
  const make = (node, v) => {
    if (node === null) return { v, l: null, r: null }
    if (v < node.v) node.l = make(node.l, v)
    else node.r = make(node.r, v)
    return node
  }
  let root = null
  for (const v of values) root = make(root, v) ?? root
  const height = n => (n === null ? 0 : 1 + Math.max(height(n.l), height(n.r)))
  return height(root)
}

test('1902 random permutations match a recursive height oracle', () => {
  let seed = 1902
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const size = 1 + rnd(12)
    const pool = Array.from({ length: 30 }, (_, i) => i)
    const values = []
    for (let i = 0; i < size; i++) values.push(pool.splice(rnd(pool.length), 1)[0])
    assert.equal(solve(values), oracle(values), JSON.stringify(values))
  }
})

test('1902 frames carry valid pseudocode and python lines and the final tree', () => {
  const run = buildTrace([4, 2, 6, 1, 3, 5, 7])
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.nodes.length <= 7)
  }
  const last = run.frames.at(-1)
  assert.equal(last.phase, 'done')
  assert.equal(last.nodes.length, 7)
  assert.equal(last.best, 3)
})
