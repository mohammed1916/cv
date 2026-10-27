import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (batchSize, groups) => buildTrace(parseInput(JSON.stringify({ batchSize, groups }))).result

test('1815 official examples', () => {
  assert.equal(solve(3, [1, 2, 3, 4, 5, 6]), 4)
  assert.equal(solve(4, [1, 3, 2, 5, 2, 2, 1, 6]), 4)
})

test('1815 a batch of one makes every group happy', () => {
  assert.equal(solve(1, [3, 5, 7]), 3)
})

test('1815 rejects bad input', () => {
  assert.throws(() => parseInput('{"batchSize":5,"groups":[1]}'))
  assert.throws(() => parseInput('{"batchSize":2,"groups":[]}'))
  assert.throws(() => parseInput('{"batchSize":2,"groups":[10]}'))
})

// Independent oracle: try every order in which the groups can be served and simulate the batches.
function oracle(b, groups) {
  let best = 0
  const order = (prefix, rest) => {
    if (rest.length === 0) {
      let used = 0
      let happy = 0
      for (const g of prefix) {
        if (used === 0) happy++
        used = (used + g) % b
      }
      best = Math.max(best, happy)
      return
    }
    rest.forEach((g, i) => order([...prefix, g], [...rest.slice(0, i), ...rest.slice(i + 1)]))
  }
  order([], groups)
  return best
}

test('1815 random inputs match the order-enumeration oracle', () => {
  let seed = 1815
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const b = 1 + rnd(4)
    const groups = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(9))
    assert.equal(solve(b, groups), oracle(b, groups), JSON.stringify({ b, groups }))
  }
})
