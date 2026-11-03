import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (word, numFriends) => buildTrace({ word, numFriends }).result

test('3406 worked presets', () => {
  assert.equal(solve('dbca', 2), 'dbc')
  assert.equal(solve('gggg', 2), 'ggg')
  assert.equal(solve('zyxzw', 1), 'zyxzw')
})

test('3406 single letter and whole-word parts', () => {
  assert.equal(solve('a', 1), 'a')
  assert.equal(solve('ab', 1), 'ab')
  assert.equal(solve('ab', 2), 'b')
  assert.equal(solve('ba', 2), 'b')
})

test('3406 parser rejects bad inputs', () => {
  assert.throws(() => parseInput('{"word":"ab","numFriends":3}'))
  assert.throws(() => parseInput('{"word":"ab","numFriends":0}'))
  assert.throws(() => parseInput('{"word":"AB","numFriends":1}'))
  assert.throws(() => parseInput('["ab",1]'))
})

// Independent oracle: enumerate every split into numFriends nonempty parts.
function oracle(word, numFriends) {
  const n = word.length
  const parts = new Set()
  // A split is a choice of numFriends - 1 cut positions among the n - 1 gaps.
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    let cuts = 0
    for (let g = 0; g < n - 1; g++) if (mask & (1 << g)) cuts++
    if (cuts !== numFriends - 1) continue
    let start = 0
    for (let g = 0; g <= n - 1; g++) {
      if (g === n - 1 || (mask & (1 << g))) {
        parts.add(word.slice(start, g + 1))
        start = g + 1
      }
    }
  }
  return [...parts].sort().at(-1)
}

test('3406 random inputs match a split-enumeration oracle', () => {
  let seed = 3406
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(7)
    const word = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    const numFriends = 1 + rnd(n)
    assert.equal(solve(word, numFriends), oracle(word, numFriends), JSON.stringify({ word, numFriends }))
  }
})

test('3406 frames keep the state the view needs', () => {
  const run = buildTrace({ word: 'cabcb', numFriends: 2 })
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(frame.cap, 4)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).answer, run.result)
})
