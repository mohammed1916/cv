import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = values => buildTrace(parseInput(JSON.stringify({ values }))).result

test('1457 official examples', () => {
  assert.equal(solve([2, 3, 1, 3, 1, null, 1]), 2)
  assert.equal(solve([2, 1, 1, 1, 3, null, null, null, null, null, 1]), 1)
  assert.equal(solve([9]), 1)
})

test('1457 a path with two odd digits is rejected', () => {
  // The only root-to-leaf path reads 1, 2: two odd counts, so no palindrome.
  assert.equal(solve([1, 2]), 0)
  // Paths 1-1 and 1-2: only the first is pseudo-palindromic.
  assert.equal(solve([1, 1, 2]), 1)
})

test('1457 rejects a digit outside 1 to 9', () => {
  assert.throws(() => parseInput('{"values":[10]}'))
})

// Independent oracle: enumerate root-to-leaf paths and sort each digit list, then pair digits up.
function oracle(values) {
  const root = treeFromLevelOrder(values)
  let count = 0
  const walk = (node, digits) => {
    if (!node) return
    const here = [...digits, node.value]
    if (!node.left && !node.right) {
      const sorted = [...here].sort((a, b) => a - b)
      let odd = 0
      for (let i = 0; i < sorted.length;) {
        let j = i
        while (j < sorted.length && sorted[j] === sorted[i]) j++
        if ((j - i) % 2 === 1) odd++
        i = j
      }
      if (odd <= 1) count++
      return
    }
    walk(node.left, here)
    walk(node.right, here)
  }
  walk(root, [])
  return count
}

test('1457 random trees match a path-sorting oracle', () => {
  let seed = 1457
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = [1 + rnd(9)]
    const size = 1 + rnd(14)
    for (let i = 1; i < size; i++) values.push(rnd(4) ? 1 + rnd(9) : null)
    assert.equal(solve(values), oracle(values), JSON.stringify(values))
  }
})
