import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, examples } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1367 worked examples', () => {
  assert.equal(solve(JSON.parse(examples[0].input)), true)
  assert.equal(solve(JSON.parse(examples[1].input)), true)
  assert.equal(solve(JSON.parse(examples[2].input)), false)
})

const node = (val, left = null, right = null) => ({ val, left, right })

test('1367 a single-node tree and a single list value', () => {
  assert.equal(solve({ head: [2], root: node(2) }), true)
  assert.equal(solve({ head: [3], root: node(2) }), false)
  assert.equal(solve({ head: [1, 2], root: node(1, node(2)) }), true)
  assert.equal(solve({ head: [1, 2], root: node(1, null, node(2)) }), true)
  assert.equal(solve({ head: [1, 2], root: node(1, node(3), node(2, node(2))) }), true)
  assert.equal(solve({ head: [1, 2, 3], root: node(1, node(3), node(2, node(2))) }), false)
})

// Independent oracle: some tree node starts a downward path that spells the list.
function oracle(head, root) {
  const matches = (n, k) => {
    if (k === head.length) return true
    if (!n) return false
    return n.val === head[k] && (matches(n.left, k + 1) || matches(n.right, k + 1))
  }
  const walk = n => Boolean(n) && (matches(n, 0) || walk(n.left) || walk(n.right))
  return walk(root)
}

test('1367 example inputs match a direct path search', () => {
  for (const e of examples) {
    const input = JSON.parse(e.input)
    assert.equal(solve(input), oracle(input.head, input.root), e.label)
  }
})
