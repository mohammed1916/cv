import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2719 official examples', () => {
  assert.equal(solve({ num1: '1', num2: '12', min_sum: 1, max_sum: 8 }), 11)
  assert.equal(solve({ num1: '1', num2: '5', min_sum: 2, max_sum: 3 }), 2)
})

test('2719 a bound with fewer digits is padded', () => {
  // Between 5 and 100, only 10 and 100 have digit sum 1.
  assert.equal(solve({ num1: '5', num2: '100', min_sum: 1, max_sum: 1 }), 2)
})

test('2719 rejects num1 greater than num2', () => {
  assert.throws(() => parseInput('{"num1":"9","num2":"3","min_sum":1,"max_sum":5}'))
})

// Independent oracle: test each integer in the range.
function oracle({ num1, num2, min_sum, max_sum }) {
  let count = 0
  for (let x = Number(num1); x <= Number(num2); x++) {
    const s = [...String(x)].reduce((a, c) => a + Number(c), 0)
    if (s >= min_sum && s <= max_sum) count++
  }
  return count % 1000000007
}

test('2719 random ranges match a direct scan', () => {
  let seed = 2719
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const a = 1 + rnd(9999)
    const b = a + rnd(10000 - a)
    const min = 1 + rnd(36)
    const max = min + rnd(37 - min)
    const input = { num1: String(a), num2: String(b), min_sum: min, max_sum: max }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
