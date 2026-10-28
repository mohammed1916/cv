import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = complexity => buildTrace(parseInput(JSON.stringify({ complexity }))).result

test('3577 official examples', () => {
  assert.equal(solve([1, 2, 3]), 2)
  assert.equal(solve([3, 3, 3, 4, 4, 4]), 0)
})

test('3577 two computers with a larger second one', () => {
  assert.equal(solve([1, 9]), 1)
})

test('3577 rejects a complexity of zero', () => {
  assert.throws(() => parseInput('{"complexity":[0,2]}'))
})

// Independent oracle: enumerate every order of the labels that starts with 0 and check each unlock step against the statement.
function oracle(complexity) {
  const n = complexity.length
  let count = 0
  const used = Array(n).fill(false)
  const order = [0]
  used[0] = true
  const extend = () => {
    if (order.length === n) {
      const unlocked = new Set()
      let valid = true
      for (const x of order) {
        if (x === 0) { unlocked.add(0); continue }
        const ok = order.some(j => unlocked.has(j) && j < x && complexity[j] < complexity[x])
        if (!ok) { valid = false; break }
        unlocked.add(x)
      }
      if (valid) count++
      return
    }
    for (let x = 1; x < n; x++) {
      if (used[x]) continue
      used[x] = true
      order.push(x)
      extend()
      order.pop()
      used[x] = false
    }
  }
  extend()
  return count % 1000000007
}

test('3577 random complexities match an enumerate-all-orders oracle', () => {
  let seed = 3577
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 120; trial++) {
    const n = 2 + rnd(5)
    const complexity = Array.from({ length: n }, () => 1 + rnd(6))
    assert.equal(solve(complexity), oracle(complexity), JSON.stringify(complexity))
  }
})
