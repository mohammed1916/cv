import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (n, m, k) => buildTrace({ n, m, k }).result

test('3560 hand-computed cases', () => {
  assert.equal(solve(3, 13, 9), 36) // 13 -> 9 + 4
  assert.equal(solve(7, 7, 7), 0)
  assert.equal(solve(20, 1, 10), 100) // 20 -> 10 + 10
  assert.equal(solve(12, 11, 11), 11) // 12 -> 11 + 1
})

// Oracle: every way to end with at most three pieces, each at most k, from cutting either log once.
function oracle(n, m, k) {
  let best = Infinity
  if (n <= k && m <= k) best = 0
  for (const [x, y] of [[n, m], [m, n]]) {
    if (y > k) continue
    for (let a = 1; a < x; a++) {
      if (a <= k && x - a <= k) best = Math.min(best, a * (x - a))
    }
  }
  return best
}

test('3560 all small valid inputs match an exhaustive oracle', () => {
  for (let k = 2; k <= 14; k++) for (let n = 1; n <= 2 * k; n++) for (let m = 1; m <= 2 * k; m++) {
    if (n > k && m > k) continue
    assert.equal(solve(n, m, k), oracle(n, m, k), `${n},${m},${k}`)
  }
})

test('3560 parseInput enforces limits and reachability', () => {
  assert.deepEqual(parseInput('{"n":3,"m":13,"k":9}'), { n: 3, m: 13, k: 9 })
  assert.throws(() => parseInput('{"n":12,"m":13,"k":9}'))
  assert.throws(() => parseInput('{"n":19,"m":1,"k":9}'))
  assert.throws(() => parseInput('{"n":1,"m":1,"k":1}'))
})

test('3560 very large input stays small in frames', () => {
  const { result, frames } = buildTrace({ n: 200000, m: 1, k: 100000 })
  assert.equal(result, 100000 * 100000)
  assert.ok(frames.length < 20)
})

test('3560 frames: no-cut path skips compare; tried costs never beat the final cut', () => {
  assert.equal(buildTrace({ n: 2, m: 5, k: 8 }).frames.filter(f => f.phase === 'try').length, 0)
  const { frames, result } = buildTrace({ n: 3, m: 13, k: 9 })
  const tried = frames.at(-1).tried
  assert.ok(tried.length >= 2)
  assert.ok(tried.every(t => t.cost >= result && t.a + t.b === 13 && t.a <= 9 && t.b <= 9))
  assert.deepEqual(frames.at(-1).loaded, [3, 4, 9])
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const f of frames) {
    assert.ok(ids.has(f.phase) && f.message)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1]?.trim())
  }
})
