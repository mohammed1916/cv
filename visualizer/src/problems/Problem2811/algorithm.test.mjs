import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: recursive search over every way to split a segment, checking each new piece.
function oracle({ nums, m }) {
  const memo = new Map()
  const sum = (l, r) => nums.slice(l, r).reduce((s, v) => s + v, 0)
  const ok = (l, r) => {
    const key = `${l},${r}`
    if (memo.has(key)) return memo.get(key)
    let res = r - l === 1
    for (let k = l + 1; k < r && !res; k++) {
      const leftValid = k - l === 1 || sum(l, k) >= m
      const rightValid = r - k === 1 || sum(k, r) >= m
      if (leftValid && rightValid && ok(l, k) && ok(k, r)) res = true
    }
    memo.set(key, res)
    return res
  }
  return ok(0, nums.length)
}

test('2811 examples', () => {
  assert.equal(solve({ nums: [2, 2, 1], m: 4 }), true)
  assert.equal(solve({ nums: [2, 1, 3], m: 5 }), false)
  assert.equal(solve({ nums: [2, 3, 3, 2, 3], m: 6 }), true)
})

test('2811 rejects a threshold of zero', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"m":0}'))
})

test('2811 random arrays match a recursive split oracle', () => {
  let seed = 2811
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(10)), m: 1 + rnd(20) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
