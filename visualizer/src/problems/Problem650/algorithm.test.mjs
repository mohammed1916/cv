import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('650 official examples', () => {
  assert.equal(buildTrace(3).result, 3)
  assert.equal(buildTrace(1).result, 0)
  assert.equal(buildTrace(12).result, 7)
})

// Oracle: BFS over (count on screen, clipboard) states. Each move costs 1 operation.
function bfs(n) {
  if (n === 1) return 0
  const seen = new Set(['1,0'])
  let frontier = [[1, 0]], steps = 0
  while (frontier.length) {
    steps++
    const next = []
    for (const [count, clip] of frontier) {
      const moves = [[count, count], [count + clip, clip]]
      if (clip) moves.push([count, clip])
      for (const [c, k] of moves) {
        if (c === n) return steps
        if (c > 2 * n) continue
        const key = `${c},${k}`
        if (!seen.has(key)) { seen.add(key); next.push([c, k]) }
      }
    }
    frontier = next
  }
  return -1
}

test('650 every n up to 60 matches a BFS over keyboard states', () => {
  for (let n = 1; n <= 60; n++) assert.equal(buildTrace(n).result, bfs(n), `n=${n}`)
})

test('650 rejects out-of-range values', () => {
  assert.throws(() => parseInput('0'))
})
