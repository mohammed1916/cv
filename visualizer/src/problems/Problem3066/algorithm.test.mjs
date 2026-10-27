import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3066 official examples', () => {
  assert.equal(solve({ nums: [2, 11, 10, 1, 3], k: 10 }), 2)
  assert.equal(solve({ nums: [1, 1, 2, 4, 9], k: 20 }), 4)
})

test('3066 numbers already at the threshold need no operations', () => {
  assert.equal(solve({ nums: [5, 6], k: 5 }), 0)
})

test('3066 rejects inputs that can never reach the threshold', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":3}'))
  // 1 and 1 combine into 3, which is the only number left and is below 5.
  assert.throws(() => parseInput('{"nums":[1,1],"k":5}'))
})

// Independent oracle: find the two smallest by linear scans instead of a heap, and return -1 when it cannot finish.
function oracle({ nums, k }) {
  const values = [...nums]
  let ops = 0
  for (;;) {
    let lo = 0
    for (let i = 1; i < values.length; i++) if (values[i] < values[lo]) lo = i
    if (values[lo] >= k) return ops
    if (values.length < 2) return -1
    const x = values[lo]
    values.splice(lo, 1)
    let second = 0
    for (let i = 1; i < values.length; i++) if (values[i] < values[second]) second = i
    const y = values[second]
    values.splice(second, 1)
    values.push(2 * Math.min(x, y) + Math.max(x, y))
    ops++
  }
}

test('3066 random inputs match a linear-scan oracle', () => {
  let seed = 3066
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400; t++) {
    const input = { nums: Array.from({ length: 2 + rnd(5) }, () => 1 + rnd(10)), k: 1 + rnd(12) }
    const expected = oracle(input)
    if (expected === -1) continue
    checked++
    assert.equal(solve(input), expected, JSON.stringify(input))
  }
  assert.ok(checked > 100)
})
