import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (number, digit) => buildTrace(parseInput(JSON.stringify({ number, digit }))).result

test('2259 examples', () => {
  assert.equal(solve('123', '3'), '12')
  assert.equal(solve('1231', '1'), '231')
  assert.equal(solve('551', '5'), '51')
})

test('2259 removing an earlier digit can be worse than a later one', () => {
  assert.equal(solve('1011', '1'), '101')
})

test('2259 rejects a digit that is not in the number', () => {
  assert.throws(() => parseInput('{"number":"123","digit":"9"}'))
  assert.throws(() => parseInput('{"number":"0123","digit":"1"}'))
})

// Independent oracle: the greedy rule. Remove the first digit that is smaller than its right neighbor,
// otherwise remove the last occurrence.
function oracle(number, digit) {
  for (let i = 0; i + 1 < number.length; i++) {
    if (number[i] === digit && number[i] < number[i + 1]) return number.slice(0, i) + number.slice(i + 1)
  }
  const last = number.lastIndexOf(digit)
  return number.slice(0, last) + number.slice(last + 1)
}

test('2259 random numbers match a greedy oracle', () => {
  let seed = 2259
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(20)
    let number = String(1 + rnd(9))
    for (let i = 1; i < len; i++) number += String(rnd(10))
    const digit = number[rnd(number.length)]
    assert.equal(solve(number, digit), oracle(number, digit), `${number} ${digit}`)
  }
})
