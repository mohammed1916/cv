import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (text, pattern) => buildTrace({ text, pattern }).result

test('10 sample inputs match the expected answers', () => {
  assert.equal(solve('aab', 'c*a*b'), true)
  assert.equal(solve('abbc', 'ab*c'), true)
  assert.equal(solve('xy', '.*y'), true)
  assert.equal(solve('ab', '.*c'), false)
  assert.equal(solve('', 'a*b*'), true)
  assert.equal(solve('aaa', 'a.'), false)
})

test('10 every frame points at real code and Python lines', () => {
  for (const [text, pattern] of [['aab', 'c*a*b'], ['mississippi', 'mis*is*p*.'], ['', 'a*']]) {
    const { frames } = buildTrace({ text: text.slice(0, 10), pattern })
    for (const frame of frames) {
      assert.ok(frame.activeLine >= 1, `${frame.phase}: ${frame.message}`)
      assert.ok(frame.pythonLine >= 1, `${frame.phase}: ${frame.message}`)
    }
  }
})

test('10 rejects malformed patterns', () => {
  assert.throws(() => parseInput('{"text":"a","pattern":"*a"}'), /star/)
  assert.throws(() => parseInput('{"text":"a","pattern":"a**"}'), /star/)
  assert.throws(() => parseInput('{"text":"AB","pattern":"a"}'), /text/)
})

// Independent oracle: plain recursion on the remaining text and pattern.
function oracle(s, p) {
  if (p.length === 0) return s.length === 0
  const first = s.length > 0 && (p[0] === '.' || p[0] === s[0])
  if (p.length >= 2 && p[1] === '*') return oracle(s, p.slice(2)) || (first && oracle(s.slice(1), p))
  return first && oracle(s.slice(1), p.slice(1))
}

test('10 random inputs match a recursive oracle', () => {
  let seed = 10
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const s = Array.from({ length: rnd(7) }, () => 'ab'[rnd(2)]).join('')
    let p = ''
    for (let k = 1 + rnd(5); p.length < k;) {
      p += 'ab.'[rnd(3)]
      if (rnd(2) === 0) p += '*'
    }
    const input = JSON.stringify({ text: s, pattern: p })
    if (/\*\*/.test(p) || p[0] === '*') continue
    parseInput(input)
    assert.equal(solve(s, p), oracle(s, p), input)
  }
})
