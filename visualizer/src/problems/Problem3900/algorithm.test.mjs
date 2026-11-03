import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every swap (including none), then take the longest balanced substring.
function oracle(s) {
  const n = s.length
  const balancedLength = t => {
    let best = 0
    for (let l = 0; l < n; l++) for (let r = l; r < n; r++) {
      const sub = t.slice(l, r + 1)
      const ones = [...sub].filter(c => c === '1').length
      if (2 * ones === sub.length) best = Math.max(best, sub.length)
    }
    return best
  }
  let best = balancedLength(s)
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = s.split('')
    ;[a[i], a[j]] = [a[j], a[i]]
    best = Math.max(best, balancedLength(a.join('')))
  }
  return best
}

test('3900 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"s":"100001"}')).result, 4)
  assert.equal(buildTrace(parseInput('{"s":"111"}')).result, 0)
})

test('3900 matches the swap oracle on random binary strings', () => {
  for (let trial = 0; trial < 150; trial++) {
    let s = ''
    const len = 1 + (trial % 9)
    for (let i = 0; i < len; i++) s += Math.random() < 0.5 ? '0' : '1'
    assert.equal(buildTrace({ s }).result, oracle(s), s)
  }
})
