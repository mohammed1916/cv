import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (s1, s2) => buildTrace({ s1, s2 }).result

test('2060 worked examples', () => {
  assert.equal(solve('internationalization', 'i18n'), true)
  assert.equal(solve('l123e', '125'), true)
  assert.equal(solve('l123e', '44'), false)
  assert.equal(solve('a5b', 'c5b'), false)
  assert.equal(solve('abc', 'dffe'), false)
})

test('2060 edge cases', () => {
  assert.equal(solve('a', 'a'), true)
  assert.equal(solve('a', 'b'), false)
  assert.equal(solve('1', 'a'), true)
  assert.equal(solve('1', '1'), true)
  assert.equal(solve('2a', 'a1'), false)
})

test('2060 rejects a leading zero and a number above 999', () => {
  assert.throws(() => parseInput('{"s1":"a01","s2":"a"}'))
  assert.throws(() => parseInput('{"s1":"a1000","s2":"a"}'))
})

test('2060 frames point at executable python lines', () => {
  const lines = python.split('\n').length
  const { frames } = buildTrace({ s1: 'a5b', s2: 'c5b' })
  for (const frame of frames) {
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= lines, JSON.stringify(frame))
  }
})

// Independent oracle: decode each encoding into a pattern (null means unknown), then
// require equal lengths and no letter disagreement at any position.
function decode(s) {
  const out = []
  for (let i = 0; i < s.length;) {
    if (/[0-9]/.test(s[i])) {
      let j = i
      while (j < s.length && /[0-9]/.test(s[j])) j++
      for (let k = 0; k < Number(s.slice(i, j)); k++) out.push(null)
      i = j
    } else {
      out.push(s[i])
      i++
    }
  }
  return out
}

function oracle(s1, s2) {
  const a = decode(s1)
  const b = decode(s2)
  if (a.length !== b.length) return false
  return a.every((c, i) => c === null || b[i] === null || c === b[i])
}

test('2060 random encodings match a pattern oracle', () => {
  let seed = 2060
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const encode = () => {
    const tokens = []
    const count = 1 + rnd(6)
    for (let t = 0; t < count; t++) {
      if (rnd(2) === 0) tokens.push(['a', 'b'][rnd(2)])
      else if (tokens.length === 0 || !/[0-9]$/.test(tokens[tokens.length - 1])) tokens.push(String(1 + rnd(3)))
    }
    return tokens.join('') || 'a'
  }
  for (let t = 0; t < 400; t++) {
    const s1 = encode()
    const s2 = encode()
    assert.equal(solve(s1, s2), oracle(s1, s2), JSON.stringify({ s1, s2 }))
  }
})
