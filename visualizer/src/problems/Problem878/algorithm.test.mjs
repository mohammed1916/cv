import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = arr => buildTrace(parseInput(JSON.stringify(arr)))

function brute(n, a, b) {
  let seen = 0
  for (let x = 1; ; x++) if (x % a === 0 || x % b === 0) if (++seen === n) return x
}

test('official examples', () => {
  assert.equal(run([1, 2, 3]).result, 2)
  assert.equal(run([4, 2, 3]).result, 6)
  assert.equal(run([5, 2, 4]).result, 10)
})

test('matches linear scan brute force', () => {
  for (let a = 2; a <= 9; a++) for (let b = 2; b <= 9; b++) for (let n = 1; n <= 40; n++) {
    assert.equal(run([n, a, b]).answer, brute(n, a, b), `${n},${a},${b}`)
  }
})

test('large input applies the modulus', () => {
  const t = run([1000000000, 40000, 40000])
  assert.equal(t.answer, 40000 * 1000000000)
  assert.equal(t.result, Number((40000n * 1000000000n) % 1000000007n))
  assert.equal(t.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[1,1,3]'))
  assert.throws(() => parseInput('[0,2,3]'))
  assert.throws(() => parseInput('[1,2]'))
})
