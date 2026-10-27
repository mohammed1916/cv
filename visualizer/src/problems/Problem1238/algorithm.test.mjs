import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: many answers are valid, so check the rules directly rather than comparing with one answer.
function isCircularCycle(perm, n, start) {
  const size = 2 ** n
  if (perm.length !== size || perm[0] !== start) return false
  if (new Set(perm).size !== size || perm.some(v => !Number.isInteger(v) || v < 0 || v >= size)) return false
  const bits = x => x.toString(2).split('1').length - 1
  return perm.every((v, i) => bits(v ^ perm[(i + 1) % size]) === 1)
}

test('1238 two bits starting at 3', () => {
  assert.deepEqual(solve({ n: 2, start: 3 }), [3, 2, 0, 1])
  assert.ok(isCircularCycle(solve({ n: 2, start: 3 }), 2, 3))
})

test('1238 one bit and zero start', () => {
  assert.deepEqual(solve({ n: 1, start: 0 }), [0, 1])
})

test('1238 rejects a start outside the range', () => {
  assert.throws(() => parseInput('{"n":2,"start":4}'))
})

test('1238 random inputs give a valid circular Gray cycle', () => {
  let seed = 1238
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const start = rnd(2 ** n)
    const input = { n, start }
    assert.ok(isCircularCycle(solve(input), n, start), JSON.stringify(input))
  }
})
