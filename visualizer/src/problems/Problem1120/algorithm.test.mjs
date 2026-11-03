import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = values => buildTrace({ values }).result
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) <= 1e-5, `${actual} vs ${expected}`)

test('1120 hand-checked presets', () => {
  close(solve([7, 2, 9, null, 4, 1]), 5)            // 9 with child 1 gives 5, beating (2+4)/2 = 3 and 23/6
  close(solve([3]), 3)
  close(solve([2, 0, 6, 0, 0, 5, 8]), 8)            // leaf 8 alone beats 6 with children (19/3) and the whole tree 3
})

test('1120 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[null, 1]'))
  assert.throws(() => parseInput('[1, null, null, 4]'))
  assert.throws(() => parseInput('[-1]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('{"values":[1]}'))
})

test('1120 trailing nulls and a single chain are handled', () => {
  close(solve([5, null, null]), 5)
  close(solve([1, null, 8, null, 2, null, 3]), 13 / 3)  // chain 8-2-3 averages 13/3, the best subtree
})

// Independent oracle: collect each subtree's node values directly, then average.
function oracle(values) {
  const nodes = values.map((val, id) => (val === null ? null : { id, val, left: null, right: null }))
  const root = nodes[0]
  const queue = [root]
  let next = 1
  for (let qi = 0; qi < queue.length; qi++) {
    const node = queue[qi]
    if (next < values.length) { node.left = nodes[next++]; if (node.left) queue.push(node.left) }
    if (next < values.length) { node.right = nodes[next++]; if (node.right) queue.push(node.right) }
  }
  if (next !== values.length) throw new Error('extra entries')
  const collect = node => (node ? [node.val, ...collect(node.left), ...collect(node.right)] : [])
  let best = -Infinity
  for (const node of nodes.filter(Boolean)) {
    const vals = collect(node)
    best = Math.max(best, vals.reduce((a, b) => a + b, 0) / vals.length)
  }
  return best
}

test('1120 random trees match a collect-and-average oracle', () => {
  let seed = 1120
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 600; t++) {
    const size = 1 + rnd(12)
    const values = [rnd(50)]
    for (let i = 1; i < size; i++) values.push(rnd(4) === 0 ? null : rnd(50))
    // Random arrays are sometimes not a complete level-order description; both sides must reject them.
    let expected
    try { expected = oracle(values) } catch { assert.throws(() => solve(values)); continue }
    close(solve(values), expected)
    checked++
  }
  assert.ok(checked >= 100, `only ${checked} valid trees were generated`)
})

test('1120 frames keep pseudocode and python line references valid', () => {
  const run = buildTrace({ values: [4, 8, 5, 0, 1, null, 6] })
    for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 11)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 15)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.done && typeof frame.done === 'object')
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.nodes.length, 6)
})
