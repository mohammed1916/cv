import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = w => buildTrace(parseInput(w)).result
// Breadth-first search over (pointer, typed prefix length) states.
const brute = word => {
  const start = '0,0'
  const dist = new Map([[start, 0]])
  const queue = [[0, 0]]
  while (queue.length) {
    const [p, k] = queue.shift()
    const d = dist.get(`${p},${k}`)
    if (k === word.length) return d
    const next = [[(p + 1) % 26, k], [(p + 25) % 26, k]]
    if (p === word.charCodeAt(k) - 97) next.push([p, k + 1])
    for (const [np, nk] of next) {
      const key = `${np},${nk}`
      if (!dist.has(key)) { dist.set(key, d + 1); queue.push([np, nk]) }
    }
  }
  return -1
}

test('1974 invented words', () => {
  assert.equal(solve('abc'), 5)
  assert.equal(solve('a'), 1)
})

test('1974 matches shortest path on short words', () => {
  for (const w of ['z', 'ba', 'za', 'bza', 'zjpc', 'mzy', 'aaaz']) assert.equal(solve(w), brute(w), w)
})
