import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = head => buildTrace(parseInput(JSON.stringify({ head }))).result

test('1290 official examples', () => {
  assert.equal(solve([1, 0, 1]), 5)
  assert.equal(solve([0]), 0)
  assert.equal(solve([1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]), 18880)
})

test('1290 a single one bit', () => {
  assert.equal(solve([1]), 1)
})

test('1290 rejects a digit other than 0 or 1', () => {
  assert.throws(() => parseInput('{"head":[1,2]}'))
})

// Independent oracle: build the bit string and let BigInt parse it in base 2.
function oracle(head) {
  return Number(BigInt('0b' + head.join('')))
}

test('1290 random bit lists match a BigInt oracle', () => {
  let seed = 1290
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const head = Array.from({ length: 1 + rnd(20) }, () => rnd(2))
    assert.equal(solve(head), oracle(head), JSON.stringify(head))
  }
})
