import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, countNodes } from './algorithm.js'

const run = n => buildTrace(parseInput(String(n)))

// Independent oracle: every valid preorder string where 1 = internal node, 0 = leaf.
function enumerate(n) {
  const out = []
  const go = (s, need, left) => {
    // need = number of subtrees still to be filled; left = nodes remaining
    if (left === 0) { if (need === 0) out.push(s); return }
    if (need === 0) return
    go(s + '1', need + 1, left - 1)
    go(s + '0', need - 1, left - 1)
  }
  go('', 1, n)
  return out
}
const preorder = t => (t === 0 ? '0' : '1' + preorder(t[0]) + preorder(t[1]))

test('official examples', () => {
  assert.equal(run(7).trees.length, 5)
  assert.deepEqual(run(3).result, [[0, 0, 0]])
  assert.deepEqual(run(1).result, [[0]])
})

test('trees match an independent preorder-string enumeration for every n', () => {
  for (let n = 1; n <= 11; n++) {
    const t = run(n)
    if (n % 2 === 0) { assert.equal(t.trees.length, 0); continue }
    const got = t.trees.map(preorder).sort()
    assert.deepEqual(got, enumerate(n).sort())
    assert.equal(new Set(got).size, got.length)
    assert.ok(t.trees.every(tree => countNodes(tree) === n))
    assert.equal(t.frames.at(-1).phase, 'done')
  }
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('12'))
  assert.throws(() => parseInput('"7"'))
  assert.throws(() => parseInput('3.5'))
})
