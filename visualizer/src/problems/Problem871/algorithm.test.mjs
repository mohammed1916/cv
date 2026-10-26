import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (target, startFuel, stations) => buildTrace(parseInput(JSON.stringify({ target, startFuel, stations }))).result

// Oracle: dp[i] = farthest distance reachable using exactly i stops.
function oracle(target, startFuel, stations) {
  const dp = [startFuel, ...Array(stations.length).fill(-1)]
  stations.forEach(([pos, gas], i) => {
    for (let j = i; j >= 0; j--) if (dp[j] >= pos) dp[j + 1] = Math.max(dp[j + 1], dp[j] + gas)
  })
  const k = dp.findIndex(d => d >= target)
  return k
}

test('official examples', () => {
  assert.equal(solve(1, 1, []), 0)
  assert.equal(solve(100, 1, [[10, 100]]), -1)
  assert.equal(solve(100, 10, [[10, 60], [20, 30], [30, 30], [60, 40]]), 2)
})

test('matches distance-per-stops DP', () => {
  for (let t = 0; t < 500; t++) {
    const target = 5 + Math.floor(Math.random() * 100)
    const positions = [...new Set(Array.from({ length: Math.floor(Math.random() * 8) }, () => 1 + Math.floor(Math.random() * (target - 1))))].sort((a, b) => a - b)
    const stations = positions.map(p => [p, 1 + Math.floor(Math.random() * 40)])
    const fuel = Math.floor(Math.random() * 40)
    assert.equal(solve(target, fuel, stations), oracle(target, fuel, stations), JSON.stringify({ target, fuel, stations }))
  }
})

test('trace shape', () => {
  const r = buildTrace(parseInput('{"target":5,"startFuel":5,"stations":[]}'))
  assert.equal(r.frames[0].phase, 'start'); assert.equal(r.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"target":10,"startFuel":1,"stations":[[5,1],[3,1]]}'))
  assert.throws(() => parseInput('{"target":10,"startFuel":1,"stations":[[10,1]]}'))
  assert.throws(() => parseInput('{"target":0,"startFuel":1,"stations":[]}'))
  assert.throws(() => parseInput('{"target":10,"startFuel":1,"stations":[[5,0]]}'))
  assert.throws(() => parseInput('3'))
})
