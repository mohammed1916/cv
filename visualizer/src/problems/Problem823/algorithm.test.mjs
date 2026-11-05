import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(arr) {
  // Count ordered pairs (left, right) by testing every product directly, then combine recursively.
  const sorted = [...arr].sort((a, b) => a - b)
  const memo = new Map()
  const trees = x => {
    if (memo.has(x)) return memo.get(x)
    let total = 1
    for (const l of sorted) for (const r of sorted) if (l * r === x) total += trees(l) * trees(r)
    memo.set(x, total)
    return total
  }
  return sorted.reduce((s, x) => s + trees(x), 0)
}

test('823 worked examples', () => {
  assert.equal(buildTrace({ arr: [2, 4] }).result, 3)
  assert.equal(buildTrace({ arr: [2, 4, 5, 10] }).result, 7)
})

test('823 random sets match a direct product search', () => {
  let state = 823
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const set = new Set()
    while (set.size < 1 + rand(6)) set.add(2 + rand(30))
    const arr = [...set]
    assert.equal(buildTrace({ arr }).result, brute(arr), JSON.stringify(arr))
  }
})

test('823 rejects duplicates', () => {
  assert.throws(() => parseInput('{"arr":[2,2]}'))
})
