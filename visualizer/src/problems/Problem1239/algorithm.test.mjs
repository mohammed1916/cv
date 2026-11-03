import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)

// Independent oracle: try every subset of words and keep the longest one whose concatenation has unique letters.
function oracle(words) {
  let best = 0
  for (let mask = 0; mask < 1 << words.length; mask++) {
    const joined = words.filter((_, i) => mask & (1 << i)).join('')
    if (new Set(joined).size === joined.length) best = Math.max(best, joined.length)
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

test('sample pairs choose two words for length 4', () => {
  const trace = buildTrace(parseInput(examples[0].input))
  checkFrames(trace)
  assert.equal(trace.result, 4)
})

test('clash sample reaches the three disjoint words', () => {
  const trace = buildTrace(parseInput(examples[1].input))
  checkFrames(trace)
  assert.equal(trace.result, 6)
  assert.equal(trace.result, oracle(['ax', 'by', 'cz', 'aa']))
})

test('a word repeating a letter is never taken', () => {
  const trace = buildTrace(parseInput(examples[2].input))
  checkFrames(trace)
  assert.equal(trace.result, 0)
  assert.ok(trace.frames.some(frame => frame.verdict === 'blocked'))
})

test('random lists of up to 7 words match the subset oracle', () => {
  let state = 41
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rand(7)
    const words = Array.from({ length: count }, () => {
      const len = 1 + rand(4)
      return Array.from({ length: len }, () => 'abcdef'[rand(6)]).join('')
    })
    assert.equal(buildTrace(parseInput(JSON.stringify(words))).result, oracle(words), JSON.stringify(words))
  }
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('not json'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('["Ab"]'))
  assert.throws(() => parseInput('["ab", 3]'))
  assert.throws(() => parseInput(JSON.stringify(Array(11).fill('a'))))
})
