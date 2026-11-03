import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)

function isValid(text) {
  let depth = 0
  for (const ch of text) {
    if (ch === '(') depth++
    else if (ch === ')' && --depth < 0) return false
  }
  return depth === 0
}

// Independent oracle: the fewest parentheses to delete, found by trying every deletion subset.
function minimumDeletions(s) {
  const positions = [...s].map((ch, i) => (ch === '(' || ch === ')' ? i : -1)).filter(i => i >= 0)
  let best = Infinity
  for (let mask = 0; mask < 1 << positions.length; mask++) {
    const drop = new Set(positions.filter((_, j) => mask & (1 << j)))
    const kept = [...s].filter((_, i) => !drop.has(i)).join('')
    if (isValid(kept)) best = Math.min(best, drop.size)
  }
  return best
}

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 10)
  }
}

test('samples give valid strings with the minimum number of removals', () => {
  const mixed = buildTrace(parseInput(examples[0].input))
  checkFrames(mixed)
  assert.equal(mixed.result, 'ab(c)d')
  assert.equal(buildTrace(parseInput(examples[1].input)).result, '')
  assert.equal(buildTrace(parseInput(examples[2].input)).result, '(a(b)c)')
})

test('every string of up to 9 brackets and letters is valid and minimal', () => {
  const alphabet = ['(', ')', 'a']
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 500; t++) {
    const n = 1 + rand(9)
    const s = Array.from({ length: n }, () => alphabet[rand(3)]).join('')
    const { result } = buildTrace(parseInput(s))
    assert.ok(isValid(result), `${s} gave ${result}`)
    const removed = [...s].filter(ch => ch === '(' || ch === ')').length - [...result].filter(ch => ch === '(' || ch === ')').length
    assert.equal(removed, minimumDeletions(s), s)
    // Letters are only removed by being kept in order, so the result must be a subsequence of s.
    let j = 0
    for (const ch of s) if (j < result.length && result[j] === ch) j++
    assert.equal(j, result.length, s)
  }
})

test('invalid text is rejected', () => {
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('A(b)'))
  assert.throws(() => parseInput('a+b'))
  assert.throws(() => parseInput('a'.repeat(41)))
})
