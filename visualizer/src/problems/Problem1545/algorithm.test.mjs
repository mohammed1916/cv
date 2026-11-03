import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, k) => buildTrace(parseInput(JSON.stringify({ n, k }))).result

// Oracle: build S_n literally from the definition.
function sequence(n) {
  let s = '0'
  for (let i = 2; i <= n; i++) {
    const inv = [...s].map(c => (c === '0' ? '1' : '0')).join('')
    s = s + '1' + [...inv].reverse().join('')
  }
  return s
}

test('1545 sample positions give the expected bits', () => {
  assert.equal(solve(3, 1), 0)
  assert.equal(solve(3, 6), 0)
  assert.equal(solve(1, 1), 0)
  assert.equal(solve(5, 16), 1)
})

test('1545 every position for n up to 10 matches the literal construction', () => {
  for (let n = 1; n <= 10; n++) {
    const s = sequence(n)
    for (let k = 1; k <= s.length; k++) {
      assert.equal(String(solve(n, k)), s[k - 1], `n=${n} k=${k}`)
    }
  }
})

test('1545 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"n":3,"k":8}'), /k/)
  assert.throws(() => parseInput('{"n":0,"k":1}'), /n/)
})
