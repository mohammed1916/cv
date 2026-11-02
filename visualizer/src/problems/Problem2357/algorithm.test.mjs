import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2357 worked examples', () => {
  assert.equal(solve([1, 5, 0, 3, 5]), 3)
  assert.equal(solve([0]), 0)
  assert.equal(solve([2, 2, 2]), 1)
})

test('2357 edge cases', () => {
  assert.equal(solve([0, 0, 0]), 0)
  assert.equal(solve([100]), 1)
  assert.equal(solve([1, 2, 3, 4, 5]), 5)
})

test('2357 rejects out of range entries', () => {
  assert.throws(() => parseInput('{"nums":[-1]}'))
  assert.throws(() => parseInput('{"nums":[101]}'))
})

// Oracle: breadth-first search over every legal operation sequence on small arrays.
function oracle(nums) {
  const key = a => a.join(',')
  let level = [nums]
  const seenStates = new Set([key(nums)])
  for (let steps = 0; ; steps++) {
    if (level.some(a => a.every(x => x === 0))) return steps
    const next = []
    for (const a of level) {
      const positives = a.filter(x => x > 0)
      const minPositive = Math.min(...positives)
      for (let x = 1; x <= minPositive; x++) {
        const b = a.map(v => (v > 0 ? v - x : v))
        if (!seenStates.has(key(b))) { seenStates.add(key(b)); next.push(b) }
      }
    }
    level = next
  }
}

test('2357 matches a breadth-first oracle on small arrays', () => {
  let seed = 2357
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => rnd(5))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
