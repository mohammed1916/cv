import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3353 worked examples', () => {
  assert.equal(solve([4, 4, 7, 2, 2, 9]), 3)
  assert.equal(solve([3, -1, -1, 6, 5]), 3)
})

test('3353 edge cases', () => {
  assert.equal(solve([5]), 0)
  assert.equal(solve([2, 2, 2]), 0)
  assert.equal(solve([1, 2]), 1)
  assert.equal(solve([1, 2, 1]), 2)
})

test('3353 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[1.5]}'))
})

// Brute oracle: breadth-first search over prefix shifts with shift sizes in -2..2 on tiny arrays.
function oracle(nums) {
  const key = a => a.join(',')
  const done = a => a.every(v => v === a[0])
  let frontier = [nums]
  const seen = new Set([key(nums)])
  for (let depth = 0; depth <= 4; depth += 1) {
    if (frontier.some(done)) return depth
    const next = []
    for (const a of frontier) {
      for (let p = 1; p <= a.length; p += 1) {
        for (let x = -2; x <= 2; x += 1) {
          if (x === 0) continue
          const b = a.map((v, i) => (i < p ? v + x : v))
          if (!seen.has(key(b))) { seen.add(key(b)); next.push(b) }
        }
      }
    }
    frontier = next
  }
  return null
}

test('3353 matches a breadth-first oracle on tiny arrays', () => {
  let seed = 3353
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t += 1) {
    const nums = Array.from({ length: 1 + rnd(4) }, () => rnd(3))
    const expected = oracle(nums)
    if (expected !== null) assert.equal(solve(nums), expected, JSON.stringify(nums))
  }
})

test('3353 frames end with equal values and a valid result', () => {
  const run = buildTrace(parseInput('{"nums":[4,4,7,2,2,9]}'))
  const last = run.frames.at(-1)
  assert.equal(last.phase, 'done')
  assert.ok(last.values.every(v => v === last.values[0]))
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 9)
})
