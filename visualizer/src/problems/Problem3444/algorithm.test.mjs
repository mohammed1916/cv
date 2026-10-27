import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace(parseInput(JSON.stringify({ nums, target }))).result

test('3444 examples', () => {
  assert.equal(solve([1, 2, 3], [4]), 1)
  assert.equal(solve([8, 4], [6]), 2)
})

test('3444 already a multiple costs nothing', () => {
  assert.equal(solve([12, 5], [3, 4]), 0)
})

test('3444 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"target":[2]}'))
  assert.throws(() => parseInput('{"nums":[2],"target":[0]}'))
  assert.throws(() => parseInput('{"nums":[2],"target":[1,2,3,4,5]}'))
})

// Independent oracle: assign every target to one number (any choice of numbers), and charge each number the
// cheapest increment that makes it a multiple of the lcm of its assigned targets. Take the cheapest assignment.
function oracle(nums, target) {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a)
  const lcm = (a, b) => (a / gcd(a, b)) * b
  let best = Infinity
  const m = target.length
  const total = nums.length ** m
  for (let code = 0; code < total; code++) {
    const groups = nums.map(() => [])
    let c = code
    for (let j = 0; j < m; j++) {
      groups[c % nums.length].push(target[j])
      c = Math.floor(c / nums.length)
    }
    let cost = 0
    nums.forEach((x, i) => {
      if (groups[i].length === 0) return
      const L = groups[i].reduce(lcm, 1)
      cost += Math.ceil(x / L) * L - x
    })
    best = Math.min(best, cost)
  }
  return best
}

test('3444 random cases match target-assignment enumeration', () => {
  let seed = 3444
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(12))
    const target = Array.from({ length: 1 + rnd(3) }, () => 1 + rnd(12))
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
})
