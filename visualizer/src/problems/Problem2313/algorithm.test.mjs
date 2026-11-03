import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (root, result) => buildTrace({ root, result: result }).result
const parse = obj => parseInput(JSON.stringify(obj))
const leaf = val => ({ val })
const op = (val, left, right) => ({ val, left, right })
const not = child => ({ val: 5, left: child })

// Brute force: flip every subset of leaves and evaluate the tree directly.
function evaluate(node, values) {
  if (node.val === 0 || node.val === 1) return Boolean(values.get(node) ?? node.val)
  if (node.val === 5) return !evaluate(node.left, values)
  const a = evaluate(node.left, values)
  const b = evaluate(node.right, values)
  if (node.val === 2) return a || b
  if (node.val === 3) return a && b
  return a !== b
}
function oracle(root, target) {
  const leaves = []
  const collect = node => {
    if (node.val === 0 || node.val === 1) { leaves.push(node); return }
    collect(node.left)
    if (node.right) collect(node.right)
  }
  collect(root)
  let best = Infinity
  for (let mask = 0; mask < (1 << leaves.length); mask++) {
    const values = new Map()
    let flips = 0
    leaves.forEach((node, k) => {
      if (mask & (1 << k)) { values.set(node, 1 - node.val); flips++ }
    })
    if (evaluate(root, values) === target && flips < best) best = flips
  }
  return best
}

test('2313 hand-checked trees', () => {
  // OR(0, 0) needs one flip to become true, zero to stay false
  assert.equal(solve(op(2, leaf(0), leaf(0)), true), 1)
  assert.equal(solve(op(2, leaf(0), leaf(0)), false), 0)
  // AND(1, NOT(1)) is already false
  assert.equal(solve(op(3, leaf(1), not(leaf(1))), false), 0)
  // XOR(1, 1) needs one flip to become true
  assert.equal(solve(op(4, leaf(1), leaf(1)), true), 1)
})

test('2313 a single leaf flips only its own bit', () => {
  assert.equal(solve(leaf(1), true), 0)
  assert.equal(solve(leaf(1), false), 1)
})

test('2313 NOT swaps the cost of its child', () => {
  assert.equal(solve(not(leaf(0)), true), 0)
  assert.equal(solve(not(leaf(0)), false), 1)
})

test('2313 random trees match an exhaustive leaf-flip oracle', () => {
  let seed = 2313
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const build = depth => {
    if (depth === 0 || rnd(3) === 0) return leaf(rnd(2))
    if (rnd(4) === 0) return not(build(depth - 1))
    return op(2 + rnd(3), build(depth - 1), build(depth - 1))
  }
  for (let t = 0; t < 300; t++) {
    const root = build(3)
    const leaves = (function count(node) { return node.val < 2 ? 1 : node.val === 5 ? count(node.left) : count(node.left) + count(node.right) })(root)
    if (leaves > 8) continue
    for (const target of [true, false]) {
      assert.equal(solve(root, target), oracle(root, target), JSON.stringify({ root, target }))
    }
  }
})

test('2313 parse rejects bad operators and shapes', () => {
  assert.throws(() => parse({ root: { val: 6 }, result: true }))
  assert.throws(() => parse({ root: { val: 2, left: leaf(1) }, result: true }))
  assert.throws(() => parse({ root: { val: 5, left: leaf(1), right: leaf(0) }, result: true }))
  assert.throws(() => parse({ root: leaf(1), result: 1 }))
  assert.throws(() => parse({ root: op(3, leaf(1), leaf(0)) }))
})

test('2313 frame invariants', () => {
  const run = buildTrace(parse({ root: op(3, op(2, leaf(1), leaf(0)), not(leaf(0))), result: true }))
  const pyLines = python.split('\n').length
  assert.equal(run.frames[0].phase, 'leaf')
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
    assert.equal(run.input.root.length, 6)
  }
  assert.equal(run.frames.at(-1).answer, run.result)
})
