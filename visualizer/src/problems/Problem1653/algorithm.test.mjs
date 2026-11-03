import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

// Independent oracle: try every subset of characters to delete; the rest must have no b before an a.
function oracle(s) {
  let best = Infinity
  for (let mask = 0; mask < 1 << s.length; mask++) {
    let kept = ''
    let deletions = 0
    for (let i = 0; i < s.length; i++) {
      if (mask & (1 << i)) deletions++
      else kept += s[i]
    }
    if (!/b[^]*a/.test(kept) && deletions < best) best = deletions
  }
  return best
}

test('1653 hand-checked strings', () => {
  assert.equal(solve('aababbab'), 2)
  assert.equal(solve('bbaa'), 2)
  assert.equal(solve('aabb'), 0)
  assert.equal(solve('b'), 0)
  assert.equal(solve('a'), 0)
  assert.equal(solve('ba'), 1)
})

test('1653 every string up to length 10 matches the subset oracle', () => {
  const all = []
  for (let len = 1; len <= 10; len++) {
    for (let mask = 0; mask < 1 << len; mask++) {
      let s = ''
      for (let i = 0; i < len; i++) s += mask & (1 << i) ? 'a' : 'b'
      all.push(s)
    }
  }
  for (const s of all) assert.equal(solve(s), oracle(s), s)
})

test('1653 long input runs in one pass and produces a finished trace', () => {
  const s = 'ab'.repeat(30)
  const { frames } = buildTrace({ s })
  assert.equal(frames.at(-1).phase, 'done')
  assert.equal(frames.filter(f => f.phase === 'inspect').length, s.length)
})

test('1653 rejects invalid characters and length', () => {
  assert.throws(() => parseInput('{"s":"abc"}'), /a or b/)
  assert.throws(() => parseInput('{"s":""}'), /1 to 60/)
  assert.throws(() => parseInput('"ab"'), /object/)
})
