import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, s) => buildTrace({ nums, s }).result

test('3781 official examples', () => {
  assert.equal(solve([2, 1, 5, 2, 3], '01010'), 7)
  assert.equal(solve([4, 7, 2, 9], '0000'), 0)
})

test('3781 edge cases: a one already at the front stays put', () => {
  assert.equal(solve([9, 1], '10'), 9)
  assert.equal(solve([1, 9], '01'), 9)
})

test('3781 rejects a non-binary character', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"s":"12"}'))
})

// Independent oracle: breadth-first search over every string reachable by the allowed swap, scoring each one.
function oracle(nums, s) {
  const seen = new Set([s])
  const queue = [s]
  let best = -Infinity
  while (queue.length) {
    const cur = queue.shift()
    let score = 0
    for (let i = 0; i < cur.length; i++) if (cur[i] === '1') score += nums[i]
    best = Math.max(best, score)
    for (let i = 0; i + 1 < cur.length; i++) {
      if (cur[i] === '0' && cur[i + 1] === '1') {
        const next = cur.slice(0, i) + '10' + cur.slice(i + 2)
        if (!seen.has(next)) { seen.add(next); queue.push(next) }
      }
    }
  }
  return best
}

test('3781 random inputs match a reachable-state oracle', () => {
  let seed = 3781
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = rnd(8) + 1
    const nums = Array.from({ length: n }, () => rnd(9) + 1)
    const s = Array.from({ length: n }, () => (rnd(2) ? '1' : '0')).join('')
    assert.equal(solve(nums, s), oracle(nums, s), `${JSON.stringify(nums)} ${s}`)
  }
})
