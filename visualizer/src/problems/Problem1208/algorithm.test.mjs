import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (s, t, maxCost) => buildTrace({ s, t, maxCost }).result

test('1208 sample walkthroughs', () => {
  assert.equal(solve('abcd', 'bcdf', 3), 3)
  assert.equal(solve('abccdef', 'abzzdef', 0), 3)
  assert.equal(solve('aaaa', 'aaaa', 0), 4)
  assert.equal(solve('aaaa', 'zzzz', 4), 0)
})

// Independent oracle: test every substring directly.
function oracle(s, t, maxCost) {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      let cost = 0
      for (let k = i; k <= j; k++) cost += Math.abs(s.charCodeAt(k) - t.charCodeAt(k))
      if (cost <= maxCost) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

let seed = 1208
const rand = n => { seed = (seed * 1664525 + 1013904223) % 4294967296; return Math.floor(seed / 65536) % n }
const word = len => Array.from({ length: len }, () => 'abcdefgh'[rand(8)]).join('')

test('1208 random cases match the all-substrings oracle', () => {
  for (let trial = 0; trial < 400; trial++) {
    const len = 1 + rand(12)
    const s = word(len)
    const t = word(len)
    const maxCost = rand(30)
    assert.equal(solve(s, t, maxCost), oracle(s, t, maxCost), JSON.stringify({ s, t, maxCost }))
  }
})

test('1208 trace extends, shrinks and records the window, ending with the answer', () => {
  const { frames, result } = buildTrace({ s: 'abcd', t: 'bcdf', maxCost: 3 })
  assert.equal(result, 3)
  assert.ok(frames.some(f => f.activeLine === 9), 'a shrink step appears')
  assert.equal(frames.at(-1).phase, 'done')
  assert.ok(frames.every(f => f.snapshot && typeof f.message === 'string'))
})

test('1208 phases and code are exported for the shared shell', () => {
  assert.deepEqual(phases.map(p => p.id), ['start', 'inspect', 'update', 'done'])
  assert.equal(code.length, 15)
  assert.ok(python.includes('equal_substring'))
})

test('1208 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"ab","t":"abc","maxCost":1}'), /same length/)
  assert.throws(() => parseInput('{"s":"ab","t":"ab","maxCost":-1}'), /0 to 100/)
  assert.throws(() => parseInput('{"s":"AB","t":"ab","maxCost":1}'), /lowercase/)
})
