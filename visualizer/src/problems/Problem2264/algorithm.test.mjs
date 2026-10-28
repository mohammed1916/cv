import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace(parseInput(JSON.stringify({ num }))).result

test('2264 examples', () => {
  assert.equal(solve('6777133339'), '777')
  assert.equal(solve('2300019'), '000')
  assert.equal(solve('42352338'), '')
})

test('2264 the largest digit wins, even at the end of the string', () => {
  assert.equal(solve('111222999'), '999')
  assert.equal(solve('9998'), '999')
})

test('2264 rejects letters and short input', () => {
  assert.throws(() => parseInput('{"num":"12a"}'))
  assert.throws(() => parseInput('{"num":"11"}'))
})

// Independent oracle: find every run of one digit that is at least three long with a regular expression.
function oracle(num) {
  let best = ''
  for (const [, digit] of num.matchAll(/(\d)\1\1/g)) if (digit > best) best = digit
  return best.repeat(3)
}

test('2264 random digit strings match a regular expression oracle', () => {
  let seed = 2264
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 3 + rnd(28)
    let num = ''
    for (let i = 0; i < len; i++) num += '0007779'[rnd(7)]
    assert.equal(solve(num), oracle(num), num)
  }
})
