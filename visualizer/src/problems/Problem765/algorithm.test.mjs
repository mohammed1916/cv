import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(row) {
  // Minimum swaps by BFS over arrangements (small n only).
  const key = a => a.join(',')
  const done = a => a.every((p, i) => i % 2 === 0 ? a[i + 1] === (p ^ 1) : true)
  const start = row.slice()
  const seen = new Map([[key(start), 0]])
  const queue = [start]
  while (queue.length) {
    const a = queue.shift()
    const d = seen.get(key(a))
    if (done(a)) return d
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) {
      const b = a.slice(); [b[i], b[j]] = [b[j], b[i]]
      if (!seen.has(key(b))) { seen.set(key(b), d + 1); queue.push(b) }
    }
  }
  return -1
}

test('765 worked examples', () => {
  assert.equal(buildTrace([0, 2, 1, 3]).result, 1)
  assert.equal(buildTrace([3, 2, 0, 1]).result, 0)
})

test('765 small rows match a breadth-first search over swaps', () => {
  let state = 765
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 120; t++) {
    const n = 2 * (1 + rand(3))
    const row = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = rand(i + 1); [row[i], row[j]] = [row[j], row[i]] }
    assert.equal(buildTrace(row).result, brute(row), JSON.stringify(row))
  }
})

test('765 rejects a row that is not a permutation', () => {
  assert.throws(() => parseInput('[0,0,1,2]'))
})
