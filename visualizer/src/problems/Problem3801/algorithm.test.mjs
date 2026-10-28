import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = lists => buildTrace({ lists }).result

test('3801 official examples', () => {
  assert.equal(solve([[1, 3, 5], [2, 4], [6, 7, 8]]), 18)
  assert.equal(solve([[1, 1, 5], [1, 4, 7, 8]]), 10)
  assert.equal(solve([[1], [3]]), 4)
  assert.equal(solve([[1], [1]]), 2)
})

test('3801 edge case: three single-element lists', () => {
  assert.equal(solve([[2], [2], [2]]), 5)
})

test('3801 rejects an unsorted list', () => {
  assert.throws(() => parseInput('{"lists":[[3,1],[2]]}'))
})

// Independent oracle: search over merge sequences directly, memoising on the multiset of current lists.
function oracle(lists) {
  const memo = new Map()
  const median = v => v[(v.length - 1) >> 1]
  const best = state => {
    if (state.length === 1) return 0
    const key = JSON.stringify([...state].map(s => s.join(',')).sort())
    if (memo.has(key)) return memo.get(key)
    let res = Infinity
    for (let i = 0; i < state.length; i++) {
      for (let j = i + 1; j < state.length; j++) {
        const a = state[i]
        const b = state[j]
        const merged = [...a, ...b].sort((x, y) => x - y)
        const c = a.length + b.length + Math.abs(median(a) - median(b))
        const rest = state.filter((_, k) => k !== i && k !== j)
        rest.push(merged)
        res = Math.min(res, c + best(rest))
      }
    }
    memo.set(key, res)
    return res
  }
  return best(lists.map(l => [...l]))
}

test('3801 random lists match a merge-sequence search oracle', () => {
  let seed = 3801
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const m = rnd(3) + 2
    const lists = Array.from({ length: m }, () => {
      const len = rnd(3) + 1
      return Array.from({ length: len }, () => rnd(41) - 20).sort((a, b) => a - b)
    })
    assert.equal(solve(lists), oracle(lists), JSON.stringify(lists))
  }
})
