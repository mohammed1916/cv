import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('678 official examples', () => {
  assert.equal(buildTrace('()').result, true)
  assert.equal(buildTrace('(*)').result, true)
  assert.equal(buildTrace('(*))').result, true)
  assert.equal(buildTrace('((((').result, false)
})

test('678 every string up to length 6 matches substitution of stars', () => {
  const balanced = s => { let d = 0; for (const c of s) { if (c === '(') d++; else if (c === ')' && --d < 0) return false } return d === 0 }
  function expand(s) {
    const i = s.indexOf('*')
    if (i < 0) return [s]
    return ['', '(', ')'].flatMap(r => expand(s.slice(0, i) + r + s.slice(i + 1)))
  }
  function visit(s) {
    if (s.length) assert.equal(buildTrace(s).result, expand(s).some(balanced), JSON.stringify(s))
    if (s.length < 6) for (const c of '()*') visit(s + c)
  }
  visit('')
})

test('678 rejects other characters', () => {
  assert.throws(() => parseInput('"(a)"'))
})
