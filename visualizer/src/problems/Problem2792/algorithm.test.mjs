import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2792 presets give the expected counts', () => {
  assert.equal(solve('{"tree":[4,2,6,1,3,5,7],"k":2}'), 1)
  assert.equal(solve('{"tree":[5,1,8,null,4,9,null],"k":1}'), 1)
  assert.equal(solve('{"tree":[3,3,3,1],"k":1}'), 2)
})

test('2792 equal values never count as smaller', () => {
  assert.equal(solve('{"tree":[2,2,2,2,2],"k":0}'), 5)
  assert.equal(solve('{"tree":[2,2,2,2,2],"k":1}'), 0)
})

test('2792 a single node counts only when k is zero', () => {
  assert.equal(solve('{"tree":[9],"k":0}'), 1)
  assert.equal(solve('{"tree":[9],"k":1}'), 0)
})

test('2792 rejects inputs outside the visualization domain', () => {
  assert.throws(() => parseInput('{"tree":[],"k":1}'))
  assert.throws(() => parseInput('{"tree":[null,1],"k":1}'))
  assert.throws(() => parseInput('{"tree":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],"k":1}'))
  assert.throws(() => parseInput('{"tree":[100],"k":1}'))
  assert.throws(() => parseInput('{"tree":[1],"k":-1}'))
  assert.throws(() => parseInput('[1]'))
})

test('2792 frames reference real pseudocode and python lines', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ tree: [4, 2, 6, 1, 3], k: 1 })
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.count >= 0 && f.count <= run.nodes.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).result, run.result)
})

// Independent oracle: build the tree recursively from the level-order list, then brute-force each subtree.
function oracle(tree, k) {
  const root = (() => {
    const nodes = tree.map(v => (v === null ? null : { v, l: null, r: null }))
    const queue = [nodes[0]]
    let c = 1
    for (let q = 0; q < queue.length; q++) {
      const node = queue[q]
      node.l = c < nodes.length ? nodes[c++] : null
      if (node.l) queue.push(node.l)
      node.r = c < nodes.length ? nodes[c++] : null
      if (node.r) queue.push(node.r)
    }
    return nodes[0]
  })()
  const subtree = n => (n ? [n.v, ...subtree(n.l), ...subtree(n.r)] : [])
  let total = 0
  const walk = n => {
    if (!n) return
    const smaller = subtree(n).filter(v => v < n.v).length
    if (smaller >= k) total++
    walk(n.l)
    walk(n.r)
  }
  walk(root)
  return total
}

test('2792 random trees match a brute-force subtree oracle', () => {
  let seed = 2792
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(12)
    const tree = Array.from({ length: size }, (_, i) => (i > 0 && rnd(4) === 0 ? null : rnd(7)))
    tree[0] = rnd(7)
    const k = rnd(5)
    assert.equal(solve(JSON.stringify({ tree, k })), oracle(tree, k), JSON.stringify({ tree, k }))
  }
})
