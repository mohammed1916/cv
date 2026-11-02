import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python, code } from './algorithm.js'

const solve = s => buildTrace({ s }).answer

test('2743 worked examples', () => {
  // Ends: a=1, ab=2, abc=3, then window 'bca' gives 3 and window 'cab' gives 3. Total 12.
  assert.equal(solve('abcab'), 12)
  assert.equal(solve('aaaa'), 4)
  assert.equal(solve('abc'), 6)
  assert.equal(solve('x'), 1)
})

test('2743 positions count even when their text is equal', () => {
  // The four single 'a' substrings are four positions, not one distinct text.
  assert.equal(solve('aaa'), 3)
  assert.equal(solve('abab'), 7)
})

test('2743 parses raw text and JSON strings', () => {
  assert.deepEqual(parseInput('"abcab"'), { s: 'abcab' })
  assert.deepEqual(parseInput('abcab'), { s: 'abcab' })
  assert.throws(() => parseInput('""'))
  assert.throws(() => buildTrace({ s: 'a'.repeat(17) }))
})

// Independent oracle: enumerate every substring and test for distinct characters.
function oracle(s) {
  let count = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const part = s.slice(i, j + 1)
      if (new Set(part).size === part.length) count++
    }
  }
  return count
}

test('2743 random strings match an enumeration oracle', () => {
  let seed = 2743
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(12)
    const s = Array.from({ length: len }, () => 'abcd'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('2743 frame invariants', () => {
  const codeLines = new Set(code.map(c => c.line))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ s: 'abcab' }).frames) {
    assert.ok(codeLines.has(frame.activeLine), `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.left >= 0)
  }
})

test('2743 python export runs on the first example', () => {
  const out = execFileSync('python3', ['-I', '-c', python], { input: '"abcab"' }).toString().trim()
  assert.equal(out, '12')
})
