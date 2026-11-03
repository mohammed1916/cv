import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (min_length, max_length, zero_group, one_group) =>
  buildTrace(parseInput(JSON.stringify({ min_length, max_length, zero_group, one_group }))).result

function checkFrames(run) {
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.equal(frame.ways.length, frame.max_length + 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

// Independent oracle: enumerate every binary string of each length and test whether it
// is a concatenation of zero_group zeros and one_group ones blocks (a regular expression).
function oracle(min_length, max_length, zero_group, one_group) {
  const pattern = new RegExp(`^(?:0{${zero_group}}|1{${one_group}})*$`)
  let count = 0
  for (let len = min_length; len <= max_length; len++) {
    for (let bits = 0; bits < 1 << len; bits++) {
      const text = bits.toString(2).padStart(len, '0')
      if (pattern.test(text)) count++
    }
  }
  return count
}

test('2533 local presets match the enumeration oracle', () => {
  assert.equal(solve(3, 5, 1, 2), oracle(3, 5, 1, 2))
  assert.equal(solve(4, 6, 2, 3), oracle(4, 6, 2, 3))
  assert.equal(solve(2, 4, 2, 2), oracle(2, 4, 2, 2))
})

test('2533 unit blocks count every binary string', () => {
  // With single-character blocks every string of each length is good: 2^1 + 2^2 + 2^3 = 14.
  assert.equal(solve(1, 3, 1, 1), 14)
})

test('2533 random parameters match the enumeration oracle', () => {
  let seed = 2533
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const zero_group = 1 + rnd(4)
    const one_group = 1 + rnd(4)
    const min_length = 1 + rnd(8)
    const max_length = min_length + rnd(6)
    assert.equal(solve(min_length, max_length, zero_group, one_group), oracle(min_length, max_length, zero_group, one_group),
      JSON.stringify({ min_length, max_length, zero_group, one_group }))
  }
})

test('2533 frame invariants hold', () => {
  checkFrames(buildTrace({ min_length: 3, max_length: 5, zero_group: 1, one_group: 2 }))
})

test('2533 rejects an inverted length range', () => {
  assert.throws(() => parseInput('{"min_length":5,"max_length":3,"zero_group":1,"one_group":1}'))
})
