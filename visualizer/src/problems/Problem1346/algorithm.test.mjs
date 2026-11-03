import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = values => buildTrace(values).result

// Independent oracle: test every ordered pair of different positions.
function brute(values) {
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values.length; j++) {
      if (i !== j && values[i] === 2 * values[j]) return true
    }
  }
  return false
}

test('double found when the smaller value comes first', () => {
  assert.equal(solve([10, 2, 5, 3]), true)
})

test('double found when the larger value comes first', () => {
  assert.equal(solve([7, 1, 14, 11]), true)
})

test('no value has a partner', () => {
  assert.equal(solve([3, 1, 7, 11]), false)
})

test('a single zero does not match itself, but two zeros do', () => {
  assert.equal(solve([0, 1]), false)
  assert.equal(solve([0, 0]), true)
})

test('negative values pair with their doubles', () => {
  assert.equal(solve([-2, -4]), true)
  assert.equal(solve([-3, 6, 1]), false)
})

test('random arrays match the brute-force oracle', () => {
  let seed = 17
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const values = Array.from({ length: n }, () => rnd(21) - 10)
    assert.equal(solve(values), brute(values), JSON.stringify(values))
  }
})

test('the parser rejects malformed input', () => {
  assert.throws(() => parseInput('{"a":1}'), /array/)
  assert.throws(() => parseInput('[1]'), /2 to 500/)
  assert.throws(() => parseInput('[1, 2.5]'), /integer/)
  assert.throws(() => parseInput('[1, 5000]'), /-1000 to 1000/)
})

test('frames use declared phases and finish with the answer', () => {
  const run = buildTrace([10, 2, 5, 3])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) assert.ok(ids.has(frame.phase) && frame.activeLine >= 1)
  assert.equal(run.frames.at(-1).phase, 'found')
})
