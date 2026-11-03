import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = arr => buildTrace({ arr }).result

function brute(arr) {
  let total = 0
  for (let s = 0; s < arr.length; s++) for (let e = s; e < arr.length; e++) {
    if ((e - s + 1) % 2 === 1) for (let k = s; k <= e; k++) total += arr[k]
  }
  return total
}

test('own samples match hand-checked sums', () => {
  assert.equal(solve([2, 1, 3]), 12)
  assert.equal(solve([7]), 7)
  assert.equal(solve([-4, 5, -1, 2]), 8)
})

test('frames carry a phase, a pseudocode line, a message and a snapshot', () => {
  const trace = buildTrace(parseInput('{"arr":[2,1,3]}'))
  for (const f of trace.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(f.snapshot && typeof f.snapshot === 'object')
  }
  assert.match(python, /def sumOddLengthSubarrays\(arr\):/)
})

test('parseInput rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"arr":[]}'), /arr/)
  assert.throws(() => parseInput('{"arr":[1.5]}'), /integers/)
})

test('random arrays match a brute-force oracle', () => {
  let seed = 1588
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rnd(10) }, () => rnd(201) - 100)
    assert.equal(solve(arr), brute(arr))
  }
})
