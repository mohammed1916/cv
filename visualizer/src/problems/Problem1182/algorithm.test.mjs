import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Direct reference: scan every position for the requested color.
function brute({ colors, queries }) {
  return queries.map(([index, color]) => {
    let best = -1
    colors.forEach((c, i) => {
      if (c !== color) return
      const d = Math.abs(i - index)
      if (best === -1 || d < best) best = d
    })
    return best
  })
}

test('sample input gives the hand-checked distances', () => {
  const input = { colors: [1, 1, 2, 1, 3, 2, 2, 3, 3], queries: [[1, 3], [2, 2], [6, 1], [4, 2]] }
  assert.deepEqual(buildTrace(input).result, [3, 0, 3, 1])
})

test('a color that never appears gives -1, and a one-element array works', () => {
  assert.deepEqual(buildTrace({ colors: [1, 1, 1], queries: [[0, 2], [2, 1]] }).result, [-1, 0])
  assert.deepEqual(buildTrace({ colors: [3], queries: [[0, 3]] }).result, [0])
})

test('random inputs agree with a linear scan', () => {
  let seed = 1182
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(20)
    const colors = Array.from({ length: n }, () => 1 + rnd(3))
    const queries = Array.from({ length: 1 + rnd(8) }, () => [rnd(n), 1 + rnd(3)])
    const input = { colors, queries }
    assert.deepEqual(buildTrace(input).result, brute(input), JSON.stringify(input))
  }
})

test('parseInput rejects bad colors and out-of-range indices', () => {
  assert.throws(() => parseInput('{"colors":[1,4],"queries":[[0,1]]}'))
  assert.throws(() => parseInput('{"colors":[1,2],"queries":[[2,1]]}'))
  assert.throws(() => parseInput('[1,2]'))
})

test('every frame names a declared phase and a code line, and the last frame is done', () => {
  const run = buildTrace({ colors: [1, 1, 2, 1, 3], queries: [[2, 1], [0, 2]] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
