import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = perm => buildTrace(perm).result
const pyLines = python.split('\n').length
const MOD = 1000000007

function assertFrames(run) {
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
}

test('3109 authored examples', () => {
  assert.equal(solve([2, 1, 3]), 2)
  assert.equal(solve([1, 2, 3, 4]), 0)
  assert.equal(solve([4, 2, 5, 1, 3]), 82)
})

test('3109 rejects non-permutations', () => {
  assert.throws(() => parseInput('[1, 1, 2]'))
  assert.throws(() => parseInput('[2, 3]'))
})

// Oracle: generate all permutations of 1..n in lexicographic order and find the index.
function permutationsInOrder(n) {
  const out = []
  const cur = []
  const used = Array(n + 1).fill(false)
  const go = () => {
    if (cur.length === n) { out.push([...cur]); return }
    for (let v = 1; v <= n; v++) {
      if (used[v]) continue
      used[v] = true; cur.push(v); go(); cur.pop(); used[v] = false
    }
  }
  go()
  return out
}

test('3109 matches the index in the lexicographic list for every permutation of up to 6 values', () => {
  for (let n = 1; n <= 6; n++) {
    permutationsInOrder(n).forEach((perm, index) => {
      assert.equal(solve(perm) % MOD, index % MOD, JSON.stringify(perm))
    })
  }
  assertFrames(buildTrace([4, 2, 5, 1, 3]))
})
