import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

test('3798 worked cases', () => {
  assert.equal(solve('1112'), '1112')
  assert.equal(solve('12121'), '1212')
  assert.equal(solve('111'), '')
})

test('3798 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ s: '2112' }).frames) {
    assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
  }
})

test('3798 matches a brute force over every subsequence', () => {
  const s = '1221'
  let best = ''
  for (let mask = 1; mask < 1 << s.length; mask++) {
    let t = ''
    for (let i = 0; i < s.length; i++) if (mask & (1 << i)) t += s[i]
    if (t.endsWith('2') && (t.length > best.length || (t.length === best.length && t > best))) best = t
  }
  assert.equal(solve(s), best)
})

test('3798 rejects characters outside 1 and 2', () => {
  assert.throws(() => parseInput('{"s":"13"}'))
})
