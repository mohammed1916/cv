import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = pairs => buildTrace(parseInput(JSON.stringify(pairs))).result

test('2764 authored presets with known answers', () => {
  assert.equal(solve([[5, -1], [3, 5], [1, 3], [4, 3], [8, 5], [9, 8]]), true)
  assert.equal(solve([[7, -1], [2, 7], [6, 2], [9, 7], [4, 6], [1, 2]]), false)
  assert.equal(solve([[1, -1], [2, 1], [3, 1], [4, 1]]), false)
})

test('2764 single node and chains', () => {
  assert.equal(solve([[10, -1]]), true)
  assert.equal(solve([[4, -1], [9, 4], [2, 9], [7, 2], [5, 7]]), true)
  assert.equal(solve([[3, -1], [6, 4], [4, 3]]), false)
})

test('2764 the first pair must be the root', () => {
  assert.equal(solve([[2, 1], [1, -1]]), false)
  assert.equal(solve([[1, -1], [2, -1]]), false)
})

test('2764 input validation', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[[1,-1],[1,1]]'))
  assert.throws(() => parseInput('[[1,-1],[2,1.5]]'))
  assert.throws(() => parseInput('[[1,-1],[2,200]]'))
})

// Brute-force oracle: try every left/right order of the children implied by the pairs.
function allPreorders(root, children) {
  const sequences = node => {
    const kids = children.get(node) || []
    if (kids.length === 0) return [[node]]
    const out = []
    const orders = kids.length === 1 ? [kids] : [kids, [...kids].reverse()]
    for (const order of orders) {
      const parts = order.map(sequences)
      const combine = (index, acc) => {
        if (index === parts.length) { out.push([node, ...acc]); return }
        for (const part of parts[index]) combine(index + 1, [...acc, ...part])
      }
      combine(0, [])
    }
    return out
  }
  return sequences(root)
}

function oracle(pairs) {
  if (pairs[0][1] !== -1) return false
  const children = new Map()
  for (const [node, parent] of pairs) {
    if (parent === -1) continue
    if (!children.has(parent)) children.set(parent, [])
    children.get(parent).push(node)
  }
  if ([...children.values()].some(kids => kids.length > 2)) return false
  const target = pairs.map(([node]) => node).join(',')
  return allPreorders(pairs[0][0], children).some(seq => seq.join(',') === target)
}

test('2764 random sequences match the brute-force oracle', () => {
  let seed = 2764
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const size = 1 + rnd(7)
    const labels = [...Array(30).keys()].map(k => k + 1)
    for (let k = labels.length - 1; k > 0; k--) { const j = rnd(k + 1); [labels[k], labels[j]] = [labels[j], labels[k]] }
    const nodes = labels.slice(0, size)
    // Build a random binary tree in preorder: each new node attaches under an open node with fewer than two children.
    const pairs = [[nodes[0], -1]]
    const open = [{ node: nodes[0], kids: 0 }]
    for (let k = 1; k < size; k++) {
      const choices = open.filter(o => o.kids < 2)
      if (choices.length === 0) break
      const pick = choices[rnd(choices.length)]
      pick.kids += 1
      pairs.push([nodes[k], pick.node])
      open.push({ node: nodes[k], kids: 0 })
    }
    // Sometimes the sequence is scrambled, which can break preorder.
    if (rnd(2) === 0 && pairs.length > 1) {
      const a = 1 + rnd(pairs.length - 1)
      const b = 1 + rnd(pairs.length - 1)
      ;[pairs[a], pairs[b]] = [pairs[b], pairs[a]]
    }
    assert.equal(solve(pairs), oracle(pairs), JSON.stringify(pairs))
  }
})

test('2764 frame invariants hold for every preset', () => {
  const presets = [
    '[[5,-1],[3,5],[1,3],[4,3],[8,5],[9,8]]',
    '[[7,-1],[2,7],[6,2],[9,7],[4,6],[1,2]]',
    '[[1,-1],[2,1],[3,1],[4,1]]',
    '[[10,-1]]',
  ]
  for (const text of presets) {
    const run = buildTrace(parseInput(text))
    const last = run.frames[run.frames.length - 1]
    assert.equal(last.ok, run.result === true ? true : false)
    for (const f of run.frames) {
      assert.ok(phases.some(p => p.id === f.phase), f.phase)
      assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= python.trim().split('\n').length)
      assert.ok(Array.isArray(f.stack) && typeof f.counts === 'object')
      assert.ok(f.message.length > 0)
    }
  }
})
