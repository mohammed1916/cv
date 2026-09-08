import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
function isPrime(n) { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true }
test('3896 examples and consecutive primes at an odd index', () => {
  for (const [nums, expected] of [[[1, 2, 3, 4], 3], [[5, 6, 7, 8], 0], [[4, 4], 1], [[90, 97], 8]]) assert.equal(buildTrace(parseInput(JSON.stringify(nums))).result, expected)
  assert.deepEqual(buildTrace([1, 2]).targets, [2, 4])
})
test('3896 every permitted value at both index parities matches trial division', () => {
  for (let start = 1; start <= 100000; start += 1000) {
    const nums = Array.from({ length: 2000 }, (_, i) => start + Math.floor(i / 2))
    const run = buildTrace(nums)
    nums.forEach((value, i) => {
      let expected = value
      while (isPrime(expected) !== (i % 2 === 0)) expected++
      assert.equal(run.targets[i], expected)
      assert.equal(run.costs[i], expected - value)
    })
    assert.equal(run.result, run.costs.reduce((a, b) => a + b, 0))
    let paid = 0
    for (const frame of run.frames) {
      if (frame.phase === 'apply') paid += frame.cost
      assert.equal(frame.total, paid)
    }
  }
})
test('3896 full constraints and invalid input', () => {
  const run = buildTrace(parseInput(JSON.stringify(Array(100000).fill(100000))))
  assert.equal(run.result, 150000)
  assert.equal(run.targets[0], 100003)
  assert.equal(run.targets[1], 100000)
  assert.equal(run.frames.length, 300002)
  for (const data of [null, [], {}, [0], [100001], [1.5], Array(100001).fill(1)]) assert.throws(() => parseInput(JSON.stringify(data)))
})
