import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, k) => buildTrace(parseInput(JSON.stringify({ n, k }))).result

test('1621 official examples', () => {
  assert.equal(solve(3, 1), 3)
  assert.equal(solve(4, 2), 5)
})

test('1621 too few points for any segment set gives zero', () => {
  assert.equal(solve(2, 2), 0)
})

test('1621 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":1,"k":1}'))
  assert.throws(() => parseInput('{"n":3,"k":0}'))
})

// Independent oracle: pick k segments from all pairs of points, sort them, and keep the sets whose
// neighbours never overlap (touching at an endpoint is allowed).
function oracle(n, k) {
  const pairs = []
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([a, b])
  let count = 0
  const choose = (start, chosen) => {
    if (chosen.length === k) {
      const sorted = [...chosen].sort((x, y) => x[0] - y[0] || x[1] - y[1])
      if (sorted.every((seg, i) => i === 0 || sorted[i - 1][1] <= seg[0])) count++
      return
    }
    for (let i = start; i < pairs.length; i++) choose(i + 1, [...chosen, pairs[i]])
  }
  choose(0, [])
  return count
}

test('1621 small inputs match the enumeration oracle', () => {
  for (let n = 2; n <= 6; n++) {
    for (let k = 1; k <= 3; k++) assert.equal(solve(n, k), oracle(n, k) % 1000000007, `n=${n} k=${k}`)
  }
})
