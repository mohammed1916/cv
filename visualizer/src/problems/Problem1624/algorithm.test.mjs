import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = s => buildTrace({ s }).result

// Independent oracle: test every pair of equal letters directly.
function oracle(s) {
  let best = -1
  for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (s[i] === s[j]) best = Math.max(best, j - i - 1)
  return best
}

test('1624 hand-made strings give the expected gaps', () => {
  assert.equal(solve('mnopqmrs'), 4)
  assert.equal(solve('abcd'), -1)
  assert.equal(solve('aa'), 0)
  assert.equal(solve('xyxzzxq'), 4)
})

test('1624 random strings match the pairwise oracle', () => {
  let seed = 3
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(20)
    const s = Array.from({ length: len }, () => 'abcdef'[rnd(6)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('1624 frames carry phase, code line, narration and snapshot', () => {
  const run = buildTrace({ s: 'mnopqmrs' })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 5)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.ok(python.includes('def max_gap_between_equal'))
})

test('1624 rejects malformed input', () => {
  assert.throws(() => parseInput('"abc"'), /object/)
  assert.throws(() => parseInput('{"s":""}'), /1 to 50/)
  assert.throws(() => parseInput('{"s":"ABC"}'), /lowercase/)
})
