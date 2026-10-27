import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2585 official examples', () => {
  assert.equal(solve({ target: 6, types: [[6, 1], [3, 2], [2, 3]] }), 7)
  assert.equal(solve({ target: 5, types: [[8, 1], [8, 2], [8, 5]] }), 4)
  assert.equal(solve({ target: 18, types: [[6, 1], [3, 2], [2, 3]] }), 1)
})

test('2585 a type cannot exceed its copy limit', () => {
  // Only two questions worth 1 point exist, so 3 points cannot come from that type alone.
  assert.equal(solve({ target: 3, types: [[2, 1]] }), 0)
  assert.equal(solve({ target: 2, types: [[2, 1]] }), 1)
})

test('2585 rejects invalid input', () => {
  assert.throws(() => parseInput('{"target":5,"types":[[9,1]]}'))
  assert.throws(() => parseInput('{"target":5,"types":[[1,0]]}'))
  assert.throws(() => parseInput('{"target":5,"types":[]}'))
})

// Independent oracle: enumerate how many questions of every type are answered.
function oracle({ target, types }) {
  let total = 0
  const pick = (t, points) => {
    if (t === types.length) {
      if (points === target) total++
      return
    }
    const [count, marks] = types[t]
    for (let k = 0; k <= count; k++) {
      const next = points + k * marks
      if (next > target) break
      pick(t + 1, next)
    }
  }
  pick(0, 0)
  return total % 1000000007
}

test('2585 random inputs match an enumeration oracle', () => {
  let seed = 2585
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const types = Array.from({ length: 1 + rnd(4) }, () => [1 + rnd(8), 1 + rnd(12)])
    const target = 1 + rnd(30)
    const input = { target, types }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
