import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Direct reference: sum every window from scratch.
function brute({ values, window, low, high }) {
  let score = 0
  for (let s = 0; s + window <= values.length; s++) {
    const total = values.slice(s, s + window).reduce((a, b) => a + b, 0)
    if (total > high) score++
    else if (total < low) score--
  }
  return score
}

test('samples: the first gives 0 and the second gives 2', () => {
  assert.equal(buildTrace(parseInput('{"values":[1,2,3,4,5],"window":2,"low":4,"high":7}')).result, 0)
  assert.equal(buildTrace(parseInput('{"values":[6,1,2,7,4,5,3],"window":3,"low":9,"high":12}')).result, 2)
})

test('a window that is always too small scores minus the window count', () => {
  assert.equal(buildTrace({ values: [0, 0, 0, 0], window: 2, low: 1, high: 5 }).result, -3)
})

test('random inputs agree with the direct window sums', () => {
  let seed = 1176
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const values = Array.from({ length: n }, () => rnd(20))
    const window = 1 + rnd(n)
    const low = rnd(30)
    const high = low + rnd(30)
    const input = { values, window, low, high }
    assert.equal(buildTrace(input).result, brute(input), JSON.stringify(input))
  }
})

test('parseInput rejects malformed objects and bad windows', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('{"values":[1,2],"window":3,"low":0,"high":1}'))
  assert.throws(() => parseInput('{"values":[1,2],"window":1,"low":5,"high":1}'))
})

test('every frame names a declared phase and a code line, and the last frame is done', () => {
  const run = buildTrace(parseInput('{"values":[1,2,3,4,5],"window":2,"low":4,"high":7}'))
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
