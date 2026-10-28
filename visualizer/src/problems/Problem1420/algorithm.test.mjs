import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, m, k) => buildTrace(parseInput(JSON.stringify({ n, m, k }))).result

test('1420 hand-checked examples', () => {
  // [1,1] [2,1] [2,2] have one search cost; [1,2] has two.
  assert.equal(solve(2, 2, 1), 3)
  // [1,2] [1,3] [2,3] have two search costs.
  assert.equal(solve(2, 3, 2), 3)
  assert.equal(solve(1, 5, 0), 0)
})

test('1420 rejects out-of-range fields', () => {
  assert.throws(() => parseInput('{"n":0,"m":2,"k":0}'))
  assert.throws(() => parseInput('{"n":2,"m":7,"k":1}'))
  assert.throws(() => parseInput('{"n":2,"m":2,"k":3}'))
})

// Independent oracle: enumerate every array with values 1..m and count the record-setting comparisons directly.
function oracle(n, m, k) {
  const arr = Array(n).fill(1)
  let count = 0
  const walk = i => {
    if (i === n) {
      let maximum = 0
      let cost = 0
      for (const v of arr) if (v > maximum) { maximum = v; cost++ }
      if (cost === k) count++
      return
    }
    for (let v = 1; v <= m; v++) { arr[i] = v; walk(i + 1) }
  }
  walk(0)
  return count
}

test('1420 random cases match the enumeration oracle', () => {
  let seed = 1420
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(5) + 1
    const m = rnd(4) + 1
    const k = rnd(n + 1)
    assert.equal(solve(n, m, k), oracle(n, m, k), `n=${n} m=${m} k=${k}`)
  }
})
