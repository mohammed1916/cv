import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('670 official examples', () => {
  assert.equal(buildTrace(2736).result, 7236)
  assert.equal(buildTrace(9973).result, 9973)
  assert.equal(buildTrace(98368).result, 98863)
})

test('670 every number up to 2000 matches a brute force over single swaps', () => {
  for (let x = 0; x <= 2000; x++) {
    const s = String(x)
    let best = x
    for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) {
      const a = s.split(''); [a[i], a[j]] = [a[j], a[i]]
      best = Math.max(best, Number(a.join('')))
    }
    assert.equal(buildTrace(x).result, best, `x=${x}`)
  }
})

test('670 rejects negative numbers', () => {
  assert.throws(() => parseInput('-5'))
})
