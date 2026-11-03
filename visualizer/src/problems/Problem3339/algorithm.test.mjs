import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, m, k) => buildTrace({ n, m, k }).result

test('3339 worked examples', () => {
  assert.equal(solve(4, 5, 2), 48)
  assert.equal(solve(3, 4, 1), 16)
})

test('3339 edge cases', () => {
  assert.equal(solve(1, 1, 0), 1)
  assert.equal(solve(2, 3, 2), 0)
  assert.equal(solve(5, 6, 0), 3159)
  assert.equal(solve(3, 1, 2), 0)
  assert.equal(solve(4, 1, 0), 1)
})

test('3339 rejects malformed input', () => {
  assert.throws(() => parseInput('{"n":0,"m":3,"k":0}'))
  assert.throws(() => parseInput('{"n":3,"m":3,"k":-1}'))
})

// Brute oracle: enumerate every array with entries 1..m and count arrays with exactly k good pairs.
function oracle(n, m, k) {
  let count = 0
  const values = Array(n).fill(1)
  const good = (a, b) => (a * b - a - b) % 2 === 0
  for (;;) {
    let pairs = 0
    for (let i = 0; i + 1 < n; i += 1) if (good(values[i], values[i + 1])) pairs += 1
    if (pairs === k) count += 1
    let pos = n - 1
    while (pos >= 0 && values[pos] === m) { values[pos] = 1; pos -= 1 }
    if (pos < 0) break
    values[pos] += 1
  }
  return count
}

test('3339 matches an enumeration oracle on small inputs', () => {
  for (let n = 1; n <= 5; n += 1) {
    for (let m = 1; m <= 4; m += 1) {
      for (let k = 0; k <= n; k += 1) {
        assert.equal(solve(n, m, k), oracle(n, m, k) % 1000000007, JSON.stringify({ n, m, k }))
      }
    }
  }
})

test('3339 frames are consistent and end at the result', () => {
  const run = buildTrace(parseInput('{"n":4,"m":5,"k":2}'))
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 15)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 24)
    if (frame.phase !== 'setup') assert.equal(frame.ev.length, 3)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).result, 48)
})
