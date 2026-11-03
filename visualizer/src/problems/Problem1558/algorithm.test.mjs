import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('1558 sample arrays give the expected counts', () => {
  assert.equal(solve([3, 5, 1]), 7)
  assert.equal(solve([8, 8]), 5)
  assert.equal(solve([0, 0, 0]), 0)
})

test('1558 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"nums":[]}'), /1 to 12/)
  assert.throws(() => parseInput('{"nums":[61]}'), /0 to 60/)
})

// Oracle: breadth-first search over states. One move increments a single element; another doubles every element.
// Values never decrease, so states above the target in any position are pruned.
function shortest(target) {
  const key = a => a.join(',')
  const goal = key(target)
  const start = target.map(() => 0)
  const dist = new Map([[key(start), 0]])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head]
    const d = dist.get(key(state))
    if (key(state) === goal) return d
    const moves = []
    for (let i = 0; i < state.length; i++) {
      const next = [...state]
      next[i] += 1
      moves.push(next)
    }
    moves.push(state.map(x => 2 * x))
    for (const next of moves) {
      if (next.some((x, i) => x > target[i])) continue
      const k = key(next)
      if (!dist.has(k)) { dist.set(k, d + 1); queue.push(next) }
    }
  }
  throw new Error('unreachable target')
}

test('1558 formula matches a breadth-first search on small targets', () => {
  let seed = 5
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(3)
    const target = Array.from({ length: len }, () => rnd(13))
    assert.equal(solve(target), shortest(target), JSON.stringify(target))
  }
})
