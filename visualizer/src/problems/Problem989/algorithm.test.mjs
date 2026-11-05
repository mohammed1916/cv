import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: convert to BigInt, add, and split the decimal string back into digits.
function bruteForce(num, k) {
  return [...(BigInt(num.join('')) + BigInt(k)).toString()].map(Number)
}

test('989 array-form addition matches BigInt addition', () => {
  const cases = [
    { num: [1, 2, 0, 0], k: 34 },
    { num: [2, 7, 4], k: 181 },
    { num: [2, 1, 5], k: 806 },
    { num: [9, 9, 9], k: 1 },
    { num: [0], k: 0 },
    { num: [9], k: 99999 },
    { num: [1, 0, 0, 0, 0], k: 9999 },
    { num: [5, 0, 5], k: 495 },
  ]
  for (const input of cases) {
    const run = buildTrace(parseInput(JSON.stringify(input)))
    assert.deepEqual(run.result, bruteForce(input.num, input.k), JSON.stringify(input))
  }
})

test('989 rejects leading zeros', () => {
  assert.throws(() => parseInput('{"num":[0,1],"k":2}'))
})
