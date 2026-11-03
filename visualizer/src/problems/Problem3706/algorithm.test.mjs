import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(words) {
  return buildTrace(parseInput(JSON.stringify(words))).result
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

// Independent oracle: check every pair.
function oracle(words) {
  let best = 0
  for (let i = 0; i < words.length; i += 1) {
    for (let j = i + 1; j < words.length; j += 1) {
      if (words[i] !== words[j]) best = Math.max(best, j - i)
    }
  }
  return best
}

test('3706 presets', () => {
  assert.equal(solve(['sun', 'sun', 'moon', 'sun']), 2)
  assert.equal(solve(['a', 'b', 'b', 'b', 'a', 'a', 'b']), 6)
  assert.equal(solve(['fox', 'fox']), 0)
})

test('3706 an unlike word only at the end', () => {
  assert.equal(solve(['m', 'm', 'm', 'z']), 3)
  assert.equal(solve(['z', 'm', 'm']), 2)
})

test('3706 random inputs match the all-pairs oracle', () => {
  let seed = 3706
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pool = ['p', 'q', 'p', 'p', 'r']
  for (let t = 0; t < 500; t += 1) {
    const words = Array.from({ length: 1 + rnd(10) }, () => pool[rnd(pool.length)])
    assert.equal(solve(words), oracle(words), JSON.stringify(words))
  }
})

test('3706 frames carry valid pseudocode and python lines', () => {
  checkFrames(buildTrace(parseInput('["a","b","b","b","a","a","b"]')))
  checkFrames(buildTrace(parseInput('["fox","fox"]')))
})

test('3706 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('["A"]'))
  assert.throws(() => parseInput('"abc"'))
})
