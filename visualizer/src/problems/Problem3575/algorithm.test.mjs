import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (vals, par) => buildTrace(parseInput(JSON.stringify({ vals, par }))).result

test('3575 official examples', () => {
  assert.equal(solve([2, 3], [-1, 0]), 8)
  assert.equal(solve([1, 5, 2], [-1, 0, 0]), 15)
  assert.equal(solve([34, 1, 2], [-1, 0, 1]), 42)
  assert.equal(solve([3, 22, 5], [-1, 0, 1]), 18)
})

test('3575 a value with a repeated digit can never be chosen', () => {
  assert.equal(solve([22], [-1]), 0)
})

test('3575 rejects a parent array with a cycle', () => {
  assert.throws(() => parseInput('{"vals":[1,2,3],"par":[-1,2,1]}'))
})

// Independent oracle: for each node, try every subset of its subtree and keep the best good one.
function oracle(vals, par) {
  const n = vals.length
  const isDescendant = (w, v) => {
    let x = w
    while (x !== -1) { if (x === v) return true; x = par[x] }
    return false
  }
  let total = 0
  for (let v = 0; v < n; v++) {
    const members = []
    for (let w = 0; w < n; w++) if (isDescendant(w, v)) members.push(w)
    let best = 0
    for (let mask = 0; mask < 1 << members.length; mask++) {
      const digits = []
      let sum = 0
      for (let i = 0; i < members.length; i++) {
        if ((mask >> i) & 1) { digits.push(...String(vals[members[i]])); sum += vals[members[i]] }
      }
      if (new Set(digits).size === digits.length) best = Math.max(best, sum)
    }
    total += best
  }
  return total % 1000000007
}

test('3575 random trees match a subset-enumeration oracle', () => {
  let seed = 3575
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 120; trial++) {
    const n = 1 + rnd(7)
    const par = [-1]
    for (let i = 1; i < n; i++) par.push(rnd(i))
    const vals = Array.from({ length: n }, () => 1 + rnd(120))
    assert.equal(solve(vals, par), oracle(vals, par), JSON.stringify({ vals, par }))
  }
})
