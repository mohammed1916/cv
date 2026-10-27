import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1601 official examples', () => {
  assert.equal(solve({ n: 5, requests: [[0, 1], [1, 0], [0, 1], [1, 2], [2, 0], [3, 4]] }), 5)
  assert.equal(solve({ n: 3, requests: [[0, 0], [1, 2], [2, 1]] }), 3)
  assert.equal(solve({ n: 4, requests: [[0, 3], [3, 1], [1, 0], [2, 1]] }), 3)
})

test('1601 a single request cannot balance by itself', () => {
  assert.equal(solve({ n: 2, requests: [[0, 1]] }), 0)
})

test('1601 rejects a building outside 0 to n-1', () => {
  assert.throws(() => parseInput('{"n":2,"requests":[[1,2]]}'))
})

// Independent oracle: try every subset of requests as a bitmask and keep the largest balanced one.
function oracle({ n, requests }) {
  const m = requests.length
  let best = 0
  for (let mask = 0; mask < 1 << m; mask++) {
    const balance = Array(n).fill(0)
    let count = 0
    for (let i = 0; i < m; i++) {
      if (!(mask & (1 << i))) continue
      count++
      balance[requests[i][0]]--
      balance[requests[i][1]]++
    }
    if (balance.every(b => b === 0)) best = Math.max(best, count)
  }
  return best
}

test('1601 seeded random inputs match a bitmask oracle', () => {
  let seed = 1601
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(4)
    const requests = Array.from({ length: 1 + rnd(7) }, () => {
      const from = rnd(n)
      let to = rnd(n)
      if (to === from) to = (from + 1) % n
      return [from, to]
    })
    const input = { n, requests }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
