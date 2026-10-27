import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1235 official examples', () => {
  assert.equal(solve('{"startTime":[1,2,3,3],"endTime":[3,4,5,6],"profit":[50,10,40,70]}'), 120)
  assert.equal(solve('{"startTime":[1,2,3,4,6],"endTime":[3,5,10,6,9],"profit":[20,20,100,70,60]}'), 150)
  assert.equal(solve('{"startTime":[1,1,1],"endTime":[2,3,4],"profit":[5,6,4]}'), 6)
})

test('1235 a job that ends exactly when another starts can be chained', () => {
  assert.equal(solve('{"startTime":[1,2],"endTime":[2,3],"profit":[4,5]}'), 9)
})

test('1235 rejects a job that does not end after it starts', () => {
  assert.throws(() => parseInput('{"startTime":[3],"endTime":[3],"profit":[1]}'))
  assert.throws(() => parseInput('{"startTime":[1,2],"endTime":[3],"profit":[1,2]}'))
})

// Independent oracle: try every subset of jobs and keep the best one with no overlaps.
function oracle({ startTime, endTime, profit }) {
  const n = startTime.length
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const chosen = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) chosen.push(i)
    const ok = chosen.every((a, x) => chosen.every((b, y) => x >= y || endTime[a] <= startTime[b] || endTime[b] <= startTime[a]))
    if (ok) best = Math.max(best, chosen.reduce((sum, i) => sum + profit[i], 0))
  }
  return best
}

test('1235 random job sets match a subset-enumeration oracle', () => {
  let seed = 1235
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const startTime = [], endTime = [], profit = []
    for (let i = 0; i < n; i++) {
      const s = rnd(15)
      startTime.push(s)
      endTime.push(s + 1 + rnd(5))
      profit.push(1 + rnd(30))
    }
    const input = { startTime, endTime, profit }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
