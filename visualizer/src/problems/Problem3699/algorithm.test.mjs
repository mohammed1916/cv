import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, l, r) => buildTrace({ n, l, r }).result

test('3699 official examples', () => {
  assert.equal(solve(3, 4, 5), 2)
  assert.equal(solve(3, 1, 3), 10)
})

test('3699 rejects l not less than r', () => {
  assert.throws(() => parseInput('{"n":3,"l":5,"r":5}'))
  assert.throws(() => parseInput('{"n":2,"l":1,"r":3}'))
})

// Independent oracle: build every array of length n over [l, r] and check the two rules directly.
function oracle(n, l, r) {
  let count = 0
  const arr = []
  const walk = () => {
    if (arr.length === n) {
      for (let i = 1; i < n; i++) if (arr[i] === arr[i - 1]) return
      for (let i = 2; i < n; i++) {
        const a = arr[i - 2]
        const b = arr[i - 1]
        const c = arr[i]
        if ((a < b && b < c) || (a > b && b > c)) return
      }
      count++
      return
    }
    for (let v = l; v <= r; v++) { arr.push(v); walk(); arr.pop() }
  }
  walk()
  return count
}

test('3699 small parameters match a full enumeration oracle', () => {
  let seed = 3699
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const l = 1 + rnd(4)
    const r = l + 1 + rnd(3)
    const n = 3 + rnd(3)
    assert.equal(solve(n, l, r), oracle(n, l, r), JSON.stringify({ n, l, r }))
  }
})
