import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(words, k) {
  return buildTrace(parseInput(JSON.stringify({ words, k }))).result
}

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= PY_COUNT)
    assert.equal(typeof frame.message, 'string')
  }
}

// Independent oracle: build the whole expanded string and index it.
function expand(words) {
  return words.map(w => [...w].map((ch, t) => ch.repeat(t + 1)).join('')).join(' ')
}

test('3744 presets', () => {
  assert.equal(solve(['ab', 'c'], 3), ' ')
  assert.equal(solve(['sun'], 5), 'n')
  const words = ['xyz', 'pq', 'r']
  assert.equal(solve(words, 8), expand(words)[8])
})

test('3744 every index of the expanded string matches the oracle', () => {
  for (const words of [['ab', 'c'], ['xyz', 'pq', 'r'], ['a', 'bc', 'def'], ['zz']]) {
    const full = expand(words)
    for (let k = 0; k < full.length; k += 1) {
      assert.equal(solve(words, k), full[k], JSON.stringify({ words, k }))
    }
  }
})

test('3744 the first and last characters', () => {
  assert.equal(solve(['abc'], 0), 'a')
  assert.equal(solve(['abc'], 5), 'c')
})

test('3744 frames carry valid pseudocode and python lines', () => {
  checkFrames(buildTrace(parseInput('{"words":["ab","c"],"k":3}')))
})

test('3744 rejects malformed input', () => {
  assert.throws(() => parseInput('{"words":["ab"],"k":3}'))
  assert.throws(() => parseInput('{"words":["AB"],"k":0}'))
  assert.throws(() => parseInput('{"words":["a"],"k":-1}'))
})
