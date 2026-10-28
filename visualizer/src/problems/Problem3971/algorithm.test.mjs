import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (value, decay, m) => buildTrace(parseInput(JSON.stringify({ value, decay, m }))).result

test('3971 official examples', () => {
  assert.equal(solve([6, 5, 4], [2, 1, 1], 4), 19)
  assert.equal(solve([7, 2, 2], [3, 2, 1], 2), 11)
  assert.equal(solve([4, 3], [5, 4], 5), 7)
})

test('3971 stops when the next gain is not positive', () => {
  assert.equal(solve([2], [2], 5), 2)
})

test('3971 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"value":[1,2],"decay":[1],"m":1}'), /same length/)
})

// Independent oracle: try every count vector (how many times each index is picked), within the limit m.
function oracle(value, decay, m) {
  const n = value.length
  let best = 0
  const counts = Array(n).fill(0)
  const score = () => {
    let total = 0
    for (let i = 0; i < n; i++) for (let t = 0; t < counts[i]; t++) total += value[i] - decay[i] * t
    return total
  }
  const walk = (i, used) => {
    if (i === n) { best = Math.max(best, score()); return }
    for (let c = 0; used + c <= m; c++) {
      counts[i] = c
      walk(i + 1, used + c)
    }
    counts[i] = 0
  }
  walk(0, 0)
  return best % 1000000007
}

test('3971 random small inputs match a count-vector oracle', () => {
  let seed = 3971
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(3)
    const value = Array.from({ length: n }, () => 1 + rnd(9))
    const decay = Array.from({ length: n }, () => 1 + rnd(9))
    const m = 1 + rnd(8)
    assert.equal(solve(value, decay, m), oracle(value, decay, m), JSON.stringify({ value, decay, m }))
  }
})
