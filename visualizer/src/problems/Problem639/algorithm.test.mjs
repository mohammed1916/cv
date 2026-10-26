import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('639 official examples', () => {
  assert.equal(buildTrace('*').result, 9)
  assert.equal(buildTrace('1*').result, 18)
  assert.equal(buildTrace('2*').result, 15)
  assert.equal(buildTrace('**').result, 96)
  assert.equal(buildTrace('06').result, 0)
})

// Oracle: expand every star into 1–9, then count decodings of each concrete string by recursion.
function countConcrete(s) {
  const f = i => {
    if (i === s.length) return 1
    if (s[i] === '0') return 0
    let total = f(i + 1)
    if (i + 1 < s.length && Number(s.slice(i, i + 2)) >= 10 && Number(s.slice(i, i + 2)) <= 26) total += f(i + 2)
    return total
  }
  return f(0)
}
function expansions(s) {
  if (!s.length) return ['']
  const rest = expansions(s.slice(1))
  const heads = s[0] === '*' ? '123456789'.split('') : [s[0]]
  return heads.flatMap(h => rest.map(r => h + r))
}

test('639 short strings match full expansion followed by recursive counting', () => {
  const alphabet = ['1', '0', '2', '6', '7', '*']
  function visit(s) {
    if (s.length && s.length <= 4) {
      const expected = expansions(s).reduce((acc, e) => acc + countConcrete(e), 0) % 1000000007
      assert.equal(buildTrace(s).result, expected, JSON.stringify(s))
    }
    if (s.length < 4) for (const c of alphabet) visit(s + c)
  }
  visit('')
})

test('639 rejects characters other than digits and stars', () => {
  assert.throws(() => parseInput('"1a"'))
})
