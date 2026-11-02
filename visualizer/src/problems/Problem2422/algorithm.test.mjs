import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('2422 worked examples', () => {
  assert.equal(solve([4, 3, 2, 1, 2, 3, 1]), 2)
  assert.equal(solve([1, 2, 1]), 0)
  assert.equal(solve([1, 2]), 1)
  assert.equal(solve([7]), 0)
})

test('2422 frames hold pointer and sum state', () => {
  const run = buildTrace([4, 3, 2, 1, 2, 3, 1])
  assert.equal(run.frames[0].phase, 'start')
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.ok(run.frames.every(f => f.i <= f.j + 1))
})

test('2422 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0,1]'))
})

// Oracle: breadth-first search over every array reachable by adjacent merges.
function oracle(nums) {
  const key = a => a.join(',')
  const isPal = a => a.every((v, k) => v === a[a.length - 1 - k])
  let level = [nums]
  const seen = new Set([key(nums)])
  for (let steps = 0; ; steps++) {
    if (level.some(isPal)) return steps
    const next = []
    for (const a of level) {
      for (let k = 0; k + 1 < a.length; k++) {
        const b = [...a.slice(0, k), a[k] + a[k + 1], ...a.slice(k + 2)]
        if (!seen.has(key(b))) { seen.add(key(b)); next.push(b) }
      }
    }
    level = next
  }
}

test('2422 random arrays match a breadth-first oracle', () => {
  let seed = 2422
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
