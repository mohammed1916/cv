import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = ranges => buildTrace({ ranges }).result

// Exhaustive search over multisets for one small range: every operation picks two distinct entries.
function brute(l, r) {
  const start = Array.from({ length: r - l + 1 }, (_, i) => l + i).sort((a, b) => a - b)
  const key = arr => arr.join(',')
  const done = arr => arr.every(v => v === 0)
  let frontier = [start]
  const seen = new Set([key(start)])
  let steps = 0
  while (!frontier.some(done)) {
    const next = []
    for (const arr of frontier) {
      if (done(arr)) continue
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const t = [...arr]
          t[i] = Math.floor(arr[i] / 4)
          t[j] = Math.floor(arr[j] / 4)
          t.sort((a, b) => a - b)
          const k = key(t)
          if (!seen.has(k)) { seen.add(k); next.push(t) }
        }
      }
    }
    frontier = next
    steps++
  }
  return steps
}

test('3495 formula matches exhaustive search on small ranges', () => {
  for (const [l, r] of [[1, 2], [2, 4], [1, 3], [2, 5], [3, 8], [1, 7], [4, 10], [5, 12]]) {
    assert.equal(solve([[l, r]]), brute(l, r), `range [${l}, ${r}]`)
  }
})

test('3495 sums independent ranges', () => {
  assert.equal(solve([[3, 7], [10, 12]]), brute(3, 7) + brute(10, 12))
})

test('3495 rejects bad ranges', () => {
  assert.throws(() => parseInput('{"ranges":[[5,2]]}'))
  assert.throws(() => parseInput('{"ranges":[[0,3]]}'))
  assert.throws(() => parseInput('{"ranges":[]}'))
})
