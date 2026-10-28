import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('1718 official examples', () => {
  assert.deepEqual(solve(3), [3, 1, 2, 3, 2])
  assert.deepEqual(solve(4), [4, 2, 3, 2, 4, 3, 1])
})

test('1718 n = 1 is the single value 1', () => {
  assert.deepEqual(solve(1), [1])
})

test('1718 rejects n outside 1 to 10', () => {
  assert.throws(() => parseInput('{"n":11}'), /1 to 10/)
})

// Independent oracle: enumerate every arrangement of the multiset {1, 2, 2, ..., n, n},
// keep the valid ones, and return the lexicographically largest.
function oracle(n) {
  const size = 2 * n - 1
  const counts = new Array(n + 1).fill(0)
  for (let k = 1; k <= n; k++) counts[k] = k === 1 ? 1 : 2
  const cur = new Array(size).fill(0)
  let best = null
  const valid = arr => {
    for (let k = 2; k <= n; k++) {
      const positions = []
      arr.forEach((v, i) => { if (v === k) positions.push(i) })
      if (positions.length !== 2 || positions[1] - positions[0] !== k) return false
    }
    return true
  }
  const larger = (a, b) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i]
    return false
  }
  const fill = pos => {
    if (pos === size) {
      if (valid(cur) && (best === null || larger(cur, best))) best = [...cur]
      return
    }
    for (let k = 1; k <= n; k++) {
      if (counts[k] === 0) continue
      counts[k]--
      cur[pos] = k
      fill(pos + 1)
      counts[k]++
    }
  }
  fill(0)
  return best
}

test('1718 small n match a full-enumeration oracle', () => {
  for (let n = 1; n <= 5; n++) assert.deepEqual(solve(n), oracle(n), `n=${n}`)
})
