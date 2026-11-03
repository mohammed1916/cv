import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Direct reference: count letters in each substring and pair them up.
function brute(text, queries) {
  return queries.map(([l, r, k]) => {
    const counts = new Map()
    for (let i = l; i <= r; i++) counts.set(text[i], (counts.get(text[i]) ?? 0) + 1)
    const odd = [...counts.values()].filter(c => c % 2 === 1).length
    return Math.floor(odd / 2) <= k
  })
}

test('sample inputs give the hand-checked answers', () => {
  const first = { text: 'abcda', queries: [[0, 4, 0], [0, 4, 1], [1, 3, 0], [1, 3, 1], [2, 2, 0]] }
  assert.deepEqual(buildTrace(first).result, [false, true, false, true, true])
  const second = { text: 'xyzzyq', queries: [[0, 5, 0], [0, 5, 2], [1, 4, 0]] }
  assert.deepEqual(buildTrace(second).result, [false, true, true])
})

test('random strings and queries agree with direct counting', () => {
  let seed = 1177
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const text = Array.from({ length: n }, () => 'abcd'[rnd(4)]).join('')
    const queries = Array.from({ length: 1 + rnd(8) }, () => {
      const l = rnd(n)
      const r = l + rnd(n - l)
      return [l, r, rnd(n + 1)]
    })
    assert.deepEqual(buildTrace({ text, queries }).result, brute(text, queries), JSON.stringify({ text, queries }))
  }
})

test('parseInput rejects non-letters and malformed queries', () => {
  assert.throws(() => parseInput('{"text":"ab1","queries":[[0,1,0]]}'))
  assert.throws(() => parseInput('{"text":"ab","queries":[[1,0,0]]}'))
  assert.throws(() => parseInput('{"text":"ab","queries":[[0,2,0]]}'))
})

test('every frame names a declared phase and a code line, and the last frame is done', () => {
  const run = buildTrace({ text: 'abcda', queries: [[0, 4, 1]] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
