import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1361 worked examples', () => {
  assert.equal(solve({ n: 4, leftChild: [1, -1, 3, -1], rightChild: [2, -1, -1, -1] }), true)
  assert.equal(solve({ n: 4, leftChild: [1, -1, 3, -1], rightChild: [2, 3, -1, -1] }), false)
  assert.equal(solve({ n: 2, leftChild: [1, 0], rightChild: [-1, -1] }), false)
})

// Independent oracle: valid exactly when some root reaches every node once with no repeats.
function oracle(n, left, right) {
  for (let root = 0; root < n; root++) {
    const seen = new Set()
    let ok = true
    const walk = v => {
      if (v === -1 || !ok) return
      if (seen.has(v)) { ok = false; return }
      seen.add(v)
      walk(left[v]); walk(right[v])
    }
    walk(root)
    if (ok && seen.size === n) return true
  }
  return false
}

test('1361 random child arrays match a root-search oracle', () => {
  let seed = 1361
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(6)
    const left = Array.from({ length: n }, () => rnd(n + 1) - 1)
    const right = Array.from({ length: n }, () => rnd(n + 1) - 1)
    assert.equal(solve({ n, leftChild: left, rightChild: right }), oracle(n, left, right), JSON.stringify({ n, left, right }))
  }
})
