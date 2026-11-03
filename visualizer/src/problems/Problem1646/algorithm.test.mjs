import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

// Independent oracle: evaluate the recursive definition with memoisation.
function oracleMax(n) {
  const memo = new Map([[0, 0], [1, 1]])
  const f = i => {
    if (memo.has(i)) return memo.get(i)
    const half = Math.floor(i / 2)
    const value = i % 2 === 0 ? f(half) : f(half) + f(half + 1)
    memo.set(i, value)
    return value
  }
  let best = 0
  for (let i = 0; i <= n; i++) best = Math.max(best, f(i))
  return best
}

test('1646 small hand-checked arrays', () => {
  assert.equal(solve(0), 0)
  assert.equal(solve(1), 1)
  assert.equal(solve(3), 2)
  assert.equal(solve(7), 3)
  assert.equal(solve(9), 4)
})

test('1646 every permitted n matches the recursive oracle', () => {
  for (let n = 0; n <= 100; n++) assert.equal(solve(n), oracleMax(n), `n=${n}`)
})

test('1646 trace frames carry phases, code lines and snapshots', () => {
  const { frames } = buildTrace({ n: 5 })
  assert.equal(frames[0].phase, 'start')
  assert.equal(frames.at(-1).phase, 'done')
  for (const frame of frames) {
    assert.ok(frame.activeLine >= 1 && frame.pythonLine >= 1, frame.message)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.snapshot && Array.isArray(frame.snapshot.values))
  }
})

test('1646 rejects malformed or out-of-range input', () => {
  assert.throws(() => parseInput('[9]'), /object/)
  assert.throws(() => parseInput('{"n":101}'), /n/)
  assert.throws(() => parseInput('{"n":-1}'), /n/)
  assert.throws(() => parseInput('{"n":"4"}'), /n/)
  assert.deepEqual(parseInput('{"n":0}'), { n: 0 })
})
