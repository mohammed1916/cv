import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (s, limit) => buildTrace(parseInput(JSON.stringify({ s, limit }))).result

test('2182 worked examples', () => {
  assert.equal(solve('cczazcc', 3), 'zzcccac')
  assert.equal(solve('aababab', 2), 'bbabaa')
  assert.equal(solve('abc', 1), 'cba')
  assert.equal(solve('zzzz', 2), 'zz')
})

test('2182 rejects invalid input', () => {
  assert.throws(() => parseInput('{"s":"AB","limit":2}'))
  assert.throws(() => parseInput('{"s":"ab","limit":0}'))
  assert.throws(() => parseInput('{"s":"","limit":2}'))
})

// Oracle: over every subsequence arrangement of the letters that respects the limit, the lexicographically largest one.
function oracle(s, limit) {
  const letters = s.split('').sort().reverse()
  const used = new Array(letters.length).fill(false)
  let best = ''
  const go = (prefix, last, run) => {
    if (prefix > best) best = prefix
    const seen = new Set()
    for (let i = 0; i < letters.length; i++) {
      if (used[i] || seen.has(letters[i])) continue
      seen.add(letters[i])
      const nextRun = letters[i] === last ? run + 1 : 1
      if (nextRun > limit) continue
      used[i] = true
      go(prefix + letters[i], letters[i], nextRun)
      used[i] = false
    }
  }
  go('', '', 0)
  return best
}

test('2182 random small strings match an exhaustive oracle', () => {
  let seed = 2182
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const s = Array.from({ length: 1 + rnd(6) }, () => 'abcd'[rnd(4)]).join('')
    const limit = 1 + rnd(3)
    assert.equal(solve(s, limit), oracle(s, limit), `${s} ${limit}`)
  }
})

test('2182 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"s":"cczazcc","limit":3}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
