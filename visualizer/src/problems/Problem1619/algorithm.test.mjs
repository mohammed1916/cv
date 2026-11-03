import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = arr => buildTrace({ arr }).result

// Independent oracle: drop the five percent at each end by a different route (filter by rank), then average.
function oracle(arr) {
  const n = arr.length, cut = n / 20
  const ranked = arr.map((v, i) => ({ v, i })).sort((p, q) => p.v - q.v || p.i - q.i)
  const kept = ranked.filter((_, rank) => rank >= cut && rank < n - cut).map(x => x.v)
  return kept.reduce((s, v) => s + v, 0) / kept.length
}

test('1619 hand-made arrays give the expected trimmed means', () => {
  const twenty = [4, 9, 1, 7, 3, 8, 2, 6, 5, 0, 100, 12, 11, 10, 13, 14, 15, 16, 17, 18]
  assert.ok(Math.abs(solve(twenty) - oracle(twenty)) < 1e-9)
  assert.equal(solve(Array(20).fill(7)), 7)
  const outlier = Array.from({ length: 20 }, (_, i) => (i === 0 ? 1000 : 0))
  assert.equal(solve(outlier), 0)
})

test('1619 random arrays match the rank-based oracle', () => {
  let seed = 5
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const len = 20 * (1 + rnd(2))
    const arr = Array.from({ length: len }, () => rnd(1001))
    const input = JSON.stringify({ arr })
    parseInput(input)
    assert.ok(Math.abs(solve(arr) - oracle(arr)) < 1e-9, input)
  }
})

test('1619 frames carry phase, code line, narration and snapshot', () => {
  const run = buildTrace({ arr: Array.from({ length: 20 }, (_, i) => (i * 37) % 101) })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 5)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.ok(python.includes('def trimmed_mean'))
})

test('1619 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput(JSON.stringify({ arr: Array(15).fill(1) })), /multiple of 20/)
  assert.throws(() => parseInput(JSON.stringify({ arr: Array(20).fill(1.5) })), /integer/)
})
