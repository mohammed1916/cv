import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = k => buildTrace(k).result

test('3091 worked examples', () => {
  assert.equal(solve(1), 0)
  assert.equal(solve(2), 1)
  assert.equal(solve(11), 5)
})

test('3091 edge cases', () => {
  assert.equal(solve(3), 2)
  assert.equal(solve(4), 2)
  assert.ok(solve(200) > 0)
  assert.throws(() => parseInput('0'))
})

// Independent oracle: breadth-first search over multisets, where each step raises one element
// by one or appends a copy of one element, until the sum reaches k.
function oracle(k) {
  const key = arr => arr.join(',')
  let frontier = [[1]]
  const seen = new Set([key([1])])
  for (let depth = 0; ; depth++) {
    for (const arr of frontier) if (arr.reduce((a, b) => a + b, 0) >= k) return depth
    const next = []
    for (const arr of frontier) {
      const options = []
      arr.forEach((v, i) => {
        const up = arr.slice(); up[i] = v + 1; options.push(up)
      })
      arr.forEach(v => options.push([...arr, v]))
      for (const opt of options) {
        const sorted = opt.slice().sort((a, b) => a - b)
        if (sorted.reduce((a, b) => a + b, 0) > 2 * k + 2) continue
        if (!seen.has(key(sorted))) { seen.add(key(sorted)); next.push(sorted) }
      }
    }
    frontier = next
  }
}

test('3091 small k match the breadth-first oracle', () => {
  for (let k = 1; k <= 14; k++) assert.equal(solve(k), oracle(k), `k=${k}`)
})
