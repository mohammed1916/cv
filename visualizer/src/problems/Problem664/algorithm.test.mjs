import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('664 official examples', () => {
  assert.equal(buildTrace('aaabbb').result, 2)
  assert.equal(buildTrace('aba').result, 2)
  assert.equal(buildTrace('a').result, 1)
})

// Oracle: breadth-first search over painted canvases. Each turn paints one contiguous interval with a letter.
function oracle(target) {
  const n = target.length
  const start = '.'.repeat(n)
  const dist = new Map([[start, 0]])
  const queue = [start]
  for (let q = 0; q < queue.length; q++) {
    const cur = queue[q]
    if (cur === target) return dist.get(cur)
    for (let i = 0; i < n; i++) for (let j = i; j < n; j++) for (const ch of new Set(target)) {
      const next = cur.slice(0, i) + ch.repeat(j - i + 1) + cur.slice(j + 1)
      if (!dist.has(next)) { dist.set(next, dist.get(cur) + 1); queue.push(next) }
    }
  }
  return -1
}

test('664 short strings match a breadth-first search over canvases', () => {
  for (const s of ['a', 'ab', 'aba', 'abab', 'aaba', 'abcab', 'abba', 'aabb', 'abcba', 'aabbaa']) {
    assert.equal(buildTrace(s).result, oracle(s), s)
  }
})

test('664 rejects uppercase input', () => {
  assert.throws(() => parseInput('"Ab"'))
})
