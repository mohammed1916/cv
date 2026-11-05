import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = p => buildTrace(parseInput(String(p))).result
// Exhaustive search: explore every multiset of values reachable by swapping one bit between two entries.
const bfs = p => {
  const top = (1 << p) - 1
  const start = Array.from({ length: top }, (_, i) => i + 1).sort((a, b) => a - b)
  const seen = new Set([start.join(',')])
  const queue = [start]
  let best = null
  while (queue.length) {
    const arr = queue.shift()
    if (arr.every(v => v > 0)) {
      const prod = arr.reduce((a, b) => a * BigInt(b), 1n)
      if (best === null || prod < best) best = prod
    }
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) for (let b = 0; b < p; b++) {
      const bi = (arr[i] >> b) & 1, bj = (arr[j] >> b) & 1
      if (bi === bj) continue
      const next = [...arr]
      next[i] ^= 1 << b
      next[j] ^= 1 << b
      next.sort((x, y) => x - y)
      const key = next.join(',')
      if (!seen.has(key)) { seen.add(key); queue.push(next) }
    }
  }
  return best
}

test('1969 small p by hand', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 6)
})

test('1969 matches exhaustive swap search for p up to 3', () => {
  for (const p of [1, 2, 3]) assert.equal(BigInt(solve(p)), bfs(p) % 1000000007n, `p=${p}`)
})
