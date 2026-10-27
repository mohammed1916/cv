import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result
const example = k => ({ n: 6, speed: [2, 10, 3, 1, 5, 8], efficiency: [5, 4, 3, 9, 7, 2], k })

test('1383 official examples', () => {
  assert.equal(solve(example(2)), 60)
  assert.equal(solve(example(3)), 68)
  assert.equal(solve(example(4)), 72)
})

test('1383 a single engineer performs at speed times efficiency', () => {
  assert.equal(solve({ n: 1, speed: [7], efficiency: [3], k: 1 }), 21)
})

test('1383 rejects mismatched arrays and k above n', () => {
  assert.throws(() => parseInput('{"n":2,"speed":[1],"efficiency":[1,2],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"speed":[1,2],"efficiency":[1,2],"k":3}'))
})

// Independent oracle: try every team of at most k engineers and score it by its speed sum times its lowest efficiency.
function oracle({ n, speed, efficiency, k }) {
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const members = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) members.push(i)
    if (members.length > k) continue
    const sum = members.reduce((acc, i) => acc + speed[i], 0)
    const low = Math.min(...members.map(i => efficiency[i]))
    best = Math.max(best, sum * low)
  }
  return best % 1000000007
}

test('1383 random inputs match a subset oracle', () => {
  let seed = 1383
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const input = { n, speed: Array.from({ length: n }, () => 1 + rnd(20)), efficiency: Array.from({ length: n }, () => 1 + rnd(20)), k: 1 + rnd(n) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
