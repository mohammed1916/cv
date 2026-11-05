import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result
// Collect every descendant explicitly, then compare.
const brute = root => {
  let count = 0
  const all = []
  const walk = n => { if (!n) return; all.push(n); walk(n.left); walk(n.right) }
  walk(root)
  const descendants = node => {
    const out = []
    const down = n => { for (const c of [n.left, n.right]) if (c) { out.push(c.val); down(c) } }
    down(node)
    return out
  }
  for (const n of all) if (n.val === descendants(n).reduce((a, b) => a + b, 0)) count++
  return count
}

test('1973 invented trees', () => {
  assert.equal(solve('[10,4,6]'), 1)
  assert.equal(solve('[3,3,null,null,null]'), 1)
  assert.equal(solve('[5]'), 0)
})

test('1973 matches explicit descendant sums', () => {
  const cases = ['[10,4,6,2,2,null,null]', '[7,2,5,1,1,3]', '[0,0,0,0,null,0,0]', '[6,3,3,1,2,null,null,null,null]']
  for (const c of cases) assert.equal(solve(c), brute(parseInput(c).root), c)
})
