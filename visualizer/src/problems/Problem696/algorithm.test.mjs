import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('696 official examples', () => {
  assert.equal(buildTrace('00110011').result, 6)
  assert.equal(buildTrace('10101').result, 4)
  assert.equal(buildTrace('00011').result, 2)
})

test('696 every binary string up to length 10 matches counting substrings with equal halves', () => {
  const count = s => {
    let total = 0
    for (let i = 0; i < s.length; i++) for (let j = i + 2; j <= s.length; j += 2) {
      const sub = s.slice(i, j), half = sub.length / 2
      if (sub.slice(0, half).split('').every(c => c === sub[0]) && sub.slice(half).split('').every(c => c === sub[half]) && sub[0] !== sub[half]) total++
    }
    return total
  }
  function visit(s) {
    if (s.length) assert.equal(buildTrace(s).result, count(s), s)
    if (s.length < 10) for (const c of '01') visit(s + c)
  }
  visit('')
})

test('696 rejects non-binary characters', () => {
  assert.throws(() => parseInput('"012"'))
})
