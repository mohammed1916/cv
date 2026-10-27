import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('995 official examples', () => {
  assert.equal(solve('{"nums":[0,1,0],"k":1}'), 2)
  assert.equal(solve('{"nums":[1,1,0],"k":2}'), -1)
  assert.equal(solve('{"nums":[0,0,0,1,0,1,1,0],"k":3}'), 3)
})

test('995 edge cases: already all ones, one bit, window equal to length', () => {
  assert.equal(solve('{"nums":[1],"k":1}'), 0)
  assert.equal(solve('{"nums":[0],"k":1}'), 1)
  assert.equal(solve('{"nums":[0,0,0],"k":3}'), 1)
  assert.equal(solve('{"nums":[0,1,0],"k":3}'), -1)
})

test('995 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[0,2],"k":1}'), /0 or 1/)
  assert.throws(() => parseInput('{"nums":[0,1],"k":3}'), /k must/)
  assert.throws(() => parseInput('{"nums":[0,1],"k":0}'), /k must/)
  assert.throws(() => parseInput('{"nums":[0,1,0,1,0,1,0,1,0,1,0,1,0],"k":1}'), /1 to 12/)
  assert.throws(() => parseInput('{"nums":[],"k":1}'), /1 to 12/)
})

// Independent oracle: breadth-first search over all 2^n bit states, where each move flips one window.
function oracle({ nums, k }) {
  const n = nums.length
  let start = 0
  nums.forEach((bit, j) => { if (bit) start |= 1 << j })
  const goal = (1 << n) - 1
  const dist = new Map([[start, 0]])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head]
    if (state === goal) return dist.get(state)
    for (let at = 0; at + k <= n; at++) {
      const next = state ^ (((1 << k) - 1) << at)
      if (!dist.has(next)) {
        dist.set(next, dist.get(state) + 1)
        queue.push(next)
      }
    }
  }
  return -1
}

test('995 random arrays match a bitmask breadth-first oracle', () => {
  let seed = 995
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let minusOne = 0
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: n }, () => rnd(2))
    const k = 1 + rnd(n)
    const input = parseInput(JSON.stringify({ nums, k }))
    const got = buildTrace(input).result
    assert.equal(got, oracle(input), JSON.stringify({ nums, k }))
    if (got === -1) minusOne++
  }
  assert.ok(minusOne > 0 && minusOne < 250)
})
