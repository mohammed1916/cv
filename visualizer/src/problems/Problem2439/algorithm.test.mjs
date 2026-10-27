import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: breadth-first search over every array reachable by moving one unit from index i to index i - 1.
function oracle({ nums }) {
  const key = a => a.join(',')
  const seen = new Set([key(nums)])
  const queue = [nums]
  let best = Math.max(...nums)
  while (queue.length) {
    const cur = queue.shift()
    best = Math.min(best, Math.max(...cur))
    for (let i = 1; i < cur.length; i++) {
      if (cur[i] === 0) continue
      const next = [...cur]
      next[i] -= 1
      next[i - 1] += 1
      if (!seen.has(key(next))) {
        seen.add(key(next))
        queue.push(next)
      }
    }
  }
  return best
}

test('2439 official examples', () => {
  assert.equal(solve({ nums: [3, 7, 1, 6] }), 5)
  assert.equal(solve({ nums: [10, 1] }), 10)
})

test('2439 a single value and an already flat array', () => {
  assert.equal(solve({ nums: [4] }), 4)
  assert.equal(solve({ nums: [2, 2, 2] }), 2)
})

test('2439 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[11]}'))
})

test('2439 random arrays match a reachable-state oracle', () => {
  let seed = 2439
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(4) }, () => rnd(7))
    assert.equal(solve({ nums }), oracle({ nums }), JSON.stringify(nums))
  }
})
