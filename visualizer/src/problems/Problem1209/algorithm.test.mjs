import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

// Independent oracle: repeatedly delete any block of k equal adjacent characters until none is left.
function oracle(s, k) {
  let text = s
  const block = new RegExp(`(.)\\1{${k - 1}}`)
  while (block.test(text)) text = text.replace(block, '')
  return text
}

test('worked examples', () => {
  assert.equal(solve('pqqqrrrpz', 3), 'ppz')
  assert.equal(solve('aabbbaa', 3), 'a')
  assert.equal(solve('aaabbb', 3), '')
  assert.equal(solve('cedar', 2), 'cedar')
  assert.equal(solve('abba', 2), '')
})

test('random strings agree with the repeated-deletion oracle', () => {
  let state = 7
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const length = 1 + rand(24)
    const s = Array.from({ length }, () => 'abc'[rand(3)]).join('')
    const k = 2 + rand(4)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})

test('parser rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"s":"ab1","k":2}'), /lowercase/)
  assert.throws(() => parseInput('{"s":"abc","k":1}'), /k must/)
  assert.throws(() => parseInput('{"s":"","k":2}'), /lowercase/)
  assert.deepEqual(parseInput('{"s":"aab","k":2}'), { s: 'aab', k: 2 })
})

test('every frame has a known phase, narration and a line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ s: 'pqqqrrrpz', k: 3 })
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
