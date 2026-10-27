import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, x, y) => buildTrace(parseInput(JSON.stringify({ n, x, y }))).result

test('3317 examples', () => {
  assert.equal(solve(1, 2, 3), 6)
  assert.equal(solve(5, 2, 1), 32)
})

test('3317 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":0,"x":2,"y":3}'))
  assert.throws(() => parseInput('{"n":2,"x":7,"y":3}'))
  assert.throws(() => parseInput('{"n":2,"x":2,"y":6}'))
})

// Independent oracle: enumerate every assignment of performers to stages. Each stage that receives someone
// takes a score from 1 to y; empty stages take no score.
function oracle(n, x, y) {
  let count = 0
  const assign = (i, stageOf) => {
    if (i === n) {
      const used = [...new Set(stageOf)]
      count += y ** used.length
      return
    }
    for (let s = 0; s < x; s++) assign(i + 1, [...stageOf, s])
  }
  assign(0, [])
  return count % 1000000007
}

test('3317 small events match assignment enumeration', () => {
  for (let n = 1; n <= 4; n++) {
    for (let x = 1; x <= 3; x++) {
      for (let y = 1; y <= 3; y++) assert.equal(solve(n, x, y), oracle(n, x, y), JSON.stringify({ n, x, y }))
    }
  }
})
