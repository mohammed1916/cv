import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = values => buildTrace(values).result

// Oracle: try every subset; a chosen subset is cooked in ascending order, so its time multiplier grows with satisfaction.
function bruteForce(values) {
  let best = 0
  for (let mask = 1; mask < 1 << values.length; mask++) {
    const chosen = values.filter((_, i) => mask & (1 << i)).sort((a, b) => a - b)
    best = Math.max(best, chosen.reduce((sum, v, i) => sum + v * (i + 1), 0))
  }
  return best
}

test('sample [4, -2, 6, -1] gives 32 from cooking -2, -1, 4, 6 in that order', () => {
  assert.equal(solve([4, -2, 6, -1]), 32)
})

test('all-negative input gives 0 by choosing no dishes', () => {
  assert.equal(solve([-3, -5]), 0)
})

test('random inputs match brute force over every subset', () => {
  let seed = 11
  const rnd = m => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(8) }, () => rnd(41) - 20)
    assert.equal(solve(values), bruteForce(values), JSON.stringify(values))
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1, "2"]'))
  assert.throws(() => parseInput('[101]'))
})

test('every frame names a declared phase and a valid code line', () => {
  const run = buildTrace([4, -2, 6, -1])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
