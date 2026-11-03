import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('3463 worked examples', () => {
  assert.equal(solve('3902'), true)
  assert.equal(solve('1234'), false)
  assert.equal(solve('000'), true)
})

// Independent oracle: after n-2 rounds each final digit is a binomial-weighted sum mod 10 (Pascal's triangle).
function oracle(s) {
  const n = s.length
  const d = [...s].map(Number)
  const C = [[1]]
  for (let r = 1; r <= n - 2; r++) {
    C[r] = [1]
    for (let k = 1; k < r; k++) C[r][k] = (C[r - 1][k - 1] + C[r - 1][k]) % 10
    C[r][r] = 1
  }
  const m = n - 2
  let first = 0
  let second = 0
  for (let i = 0; i <= m; i++) {
    first = (first + C[m][i] * d[i]) % 10
    second = (second + C[m][i] * d[i + 1]) % 10
  }
  return first === second
}

test('3463 matches the binomial oracle on every short string', () => {
  for (let n = 3; n <= 5; n++) {
    const total = 10 ** n
    for (let value = 0; value < total; value += 1) {
      const s = String(value).padStart(n, '0')
      assert.equal(solve(s), oracle(s), s)
    }
  }
})

test('3463 rejects strings that are not 3 to 12 digits', () => {
  assert.throws(() => parseInput('{"s":"12"}'))
  assert.throws(() => parseInput('{"s":"12a"}'))
})
