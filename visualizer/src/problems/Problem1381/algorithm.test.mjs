import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (max_size, operations) => buildTrace(parseInput(JSON.stringify({ max_size, operations }))).result

test('1381 official example', () => {
  const ops = [['push', 1], ['push', 2], ['pop'], ['push', 2], ['push', 3], ['push', 4], ['increment', 5, 100], ['increment', 2, 100], ['pop'], ['pop'], ['pop'], ['pop']]
  assert.deepEqual(solve(3, ops), [2, 103, 202, 201, -1])
})

test('1381 a full stack ignores push and an empty stack pops -1', () => {
  assert.deepEqual(solve(1, [['push', 5], ['push', 6], ['pop'], ['pop']]), [5, -1])
})

test('1381 rejects an unknown operation', () => {
  assert.throws(() => parseInput('{"max_size":2,"operations":[["peek"]]}'))
})

// Independent oracle: keep a plain array and apply every increment to the affected entries directly.
function oracle(max_size, operations) {
  const stack = []
  const out = []
  for (const [name, a, b] of operations) {
    if (name === 'push') { if (stack.length < max_size) stack.push(a) }
    else if (name === 'pop') out.push(stack.length ? stack.pop() : -1)
    else { for (let i = 0; i < Math.min(a, stack.length); i++) stack[i] += b }
  }
  return out
}

test('1381 random operation sequences match a direct-simulation oracle', () => {
  let seed = 1381
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const max_size = 1 + rnd(5)
    const operations = Array.from({ length: 1 + rnd(15) }, () => {
      const kind = rnd(3)
      if (kind === 0) return ['push', 1 + rnd(20)]
      if (kind === 1) return ['pop']
      return ['increment', rnd(7), 1 + rnd(20)]
    })
    assert.deepEqual(solve(max_size, operations), oracle(max_size, operations), JSON.stringify({ max_size, operations }))
  }
})
