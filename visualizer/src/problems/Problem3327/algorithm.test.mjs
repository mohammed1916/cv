import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (parent, s) => buildTrace({ parent, s }).result

test('3327 official examples', () => {
  assert.deepEqual(solve([-1, 0, 0, 1, 1, 2], 'aababa'), [true, true, false, true, true, true])
  assert.deepEqual(solve([-1, 0, 0, 0, 0], 'aabcb'), [true, true, true, true, true])
})

test('3327 a single node is a palindrome', () => {
  assert.deepEqual(solve([-1], 'z'), [true])
})

test('3327 rejects a parent array that is not a tree', () => {
  assert.throws(() => parseInput('{"parent":[-1,2,1],"s":"abc"}'))
})

// Independent oracle: list each subtree in post-order with an explicit stack (children visited in
// increasing order), read the letters in that order, and test the result.
function oracle(parent, s) {
  const n = parent.length
  const children = Array.from({ length: n }, () => [])
  for (let v = 1; v < n; v++) children[parent[v]].push(v)
  for (const list of children) list.sort((a, b) => a - b)
  const postOrder = x => {
    const out = []
    const stack = [[x, false]]
    while (stack.length > 0) {
      const [v, done] = stack.pop()
      if (done) { out.push(v); continue }
      stack.push([v, true])
      for (const c of [...children[v]].reverse()) stack.push([c, false])
    }
    return out
  }
  return Array.from({ length: n }, (_, x) => {
    const str = postOrder(x).map(v => s[v]).join('')
    return str === [...str].reverse().join('')
  })
}

test('3327 random trees match a post-order list oracle', () => {
  let seed = 3327
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(9)
    const parent = [-1, ...Array.from({ length: n - 1 }, (_, i) => rnd(i + 1))]
    const s = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    assert.deepEqual(solve(parent, s), oracle(parent, s), JSON.stringify({ parent, s }))
  }
})
