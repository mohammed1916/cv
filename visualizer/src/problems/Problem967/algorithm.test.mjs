import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('967 official examples', () => {
  assert.deepEqual(buildTrace({ n: 3, k: 7 }).result, [181, 292, 707, 818, 929])
  assert.deepEqual(buildTrace({ n: 2, k: 1 }).result, [10, 12, 21, 23, 32, 34, 43, 45, 54, 56, 65, 67, 76, 78, 87, 89, 98])
})

test('967 k of zero gives repeated digits', () => {
  assert.deepEqual(buildTrace({ n: 2, k: 0 }).result, [11, 22, 33, 44, 55, 66, 77, 88, 99])
})

test('967 rejects a single digit', () => {
  assert.throws(() => parseInput('{"n":1,"k":0}'))
})

// Independent oracle: test every number with n digits and no leading zero.
function oracle(n, k) {
  const out = []
  for (let x = 10 ** (n - 1); x < 10 ** n; x++) {
    const s = String(x)
    let ok = true
    for (let i = 1; i < s.length; i++) if (Math.abs(Number(s[i]) - Number(s[i - 1])) !== k) ok = false
    if (ok) out.push(x)
  }
  return out
}

test('967 every n up to 5 and every k matches an enumeration', () => {
  for (let n = 2; n <= 5; n++) for (let k = 0; k <= 9; k++) {
    assert.deepEqual(buildTrace({ n, k }).result, oracle(n, k), `n=${n} k=${k}`)
  }
})
