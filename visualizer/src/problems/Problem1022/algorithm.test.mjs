import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = root => buildTrace({ root }).result

test('1022 official examples', () => {
  assert.equal(solve([1, 0, 1, 0, 1, 0, 1]), 22)
  assert.equal(solve([0]), 0)
  assert.equal(solve([1]), 1)
})

test('1022 a missing child is skipped, not read as zero', () => {
  // Leaves read 101 (5) and 11 (3).
  assert.equal(solve([1, 0, 1, null, 1]), 8)
})

test('1022 rejects values other than 0 and 1, and a null root', () => {
  assert.throws(() => parseInput('{"root":[2]}'))
  assert.throws(() => parseInput('{"root":[null]}'))
})

// Independent oracle: spell every root-to-leaf path as a binary string and parse it.
function oracle(root) {
  const tree = treeFromLevelOrder(root)
  let sum = 0
  const walk = (current, text) => {
    if (!current) return
    const spelled = text + String(current.value)
    if (!current.left && !current.right) sum += parseInt(spelled, 2)
    walk(current.left, spelled)
    walk(current.right, spelled)
  }
  walk(tree, '')
  return sum
}

test('1022 random trees match a path-string oracle', () => {
  let seed = 1022
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const root = [rnd(2)]
    const size = 1 + rnd(14)
    for (let i = 1; i < size; i++) root.push(rnd(3) ? rnd(2) : null)
    assert.equal(solve(root), oracle(root), JSON.stringify(root))
  }
})
