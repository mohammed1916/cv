import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = head => buildTrace(parseInput(JSON.stringify({ head }))).result

test('2816 official examples', () => {
  assert.deepEqual(solve([1, 8, 9]), [3, 7, 8])
  assert.deepEqual(solve([9, 9, 9]), [1, 9, 9, 8])
  assert.deepEqual(solve([0]), [0])
})

test('2816 carry out of the top digit', () => {
  assert.deepEqual(solve([5]), [1, 0])
})

test('2816 rejects a leading zero', () => {
  assert.throws(() => parseInput('{"head":[0,5]}'))
})

// Independent oracle: double the whole number with BigInt and split it back into digits.
function oracle(head) {
  return String(BigInt(head.join('')) * 2n).split('').map(Number)
}

test('2816 random digit lists match a BigInt oracle', () => {
  let seed = 2816
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(10)
    const head = Array.from({ length: len }, () => rnd(10))
    if (len > 1 && head[0] === 0) head[0] = 1 + rnd(9)
    assert.deepEqual(solve(head), oracle(head), JSON.stringify(head))
  }
})
