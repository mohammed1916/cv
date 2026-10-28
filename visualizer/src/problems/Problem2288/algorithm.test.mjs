import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (sentence, discount) => buildTrace(parseInput(JSON.stringify({ sentence, discount }))).result

test('2288 examples', () => {
  assert.equal(solve('there are $1 $2 and 5$ candies in the shop', 50), 'there are $0.50 $1.00 and 5$ candies in the shop')
  assert.equal(solve('1 2 $3 4 $5 $6 7 8$ $9 $10$', 100), '1 2 $0.00 4 $0.00 $0.00 7 8$ $0.00 $10$')
})

test('2288 cents are exact with no floating-point error', () => {
  assert.equal(solve('$3', 33), '$2.01')
  assert.equal(solve('$1', 1), '$0.99')
})

test('2288 rejects a discount above 100', () => {
  assert.throws(() => parseInput('{"sentence":"$1","discount":101}'))
})

// Independent oracle: a regular expression finds each price, and the replacement uses a rounded cent count.
function oracle(sentence, discount) {
  return sentence.replace(/(^| )\$([0-9]+)(?= |$)/g, (_, lead, digits) => {
    const cents = Number(digits) * (100 - discount)
    return `${lead}$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`
  })
}

test('2288 random sentences match a regular-expression oracle', () => {
  let seed = 2288
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pieces = ['$12', '$5', '7', '$', '$3x', '8$', '$100', 'abc', '$0', '$999999']
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(6)
    const words = []
    for (let w = 0; w < count; w++) words.push(pieces[rnd(pieces.length)])
    const sentence = words.join(' ')
    const discount = rnd(101)
    assert.equal(solve(sentence, discount), oracle(sentence, discount), sentence)
  }
})
